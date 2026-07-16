/**
 * Per-module CPU attribution for script bundles that concatenate many
 * logical modules into a single URL (e.g. MediaWiki ResourceLoader
 * load.php responses). cpu.urls can only say "load.php used 267 ms of
 * main thread"; this analysis splits that time across the modules
 * inside each bundle so the owner of a slow module can be identified.
 *
 * This file is bundle-format agnostic. It walks the main-thread task
 * tree and, for every task whose most-specific code location falls
 * inside a known bundle URL, asks that bundle's resolver which module
 * owns the source position. All knowledge about the bundle format
 * (module delimiters, line/column → byte-offset math) lives in the
 * resolver — see lib/chrome/mediawikiResourceLoader.js.
 *
 * Attribution rules per task (selfTime is exclusive of children, so
 * nothing is counted twice):
 *  - EvaluateScript / v8.compile / v8.compileModule on a bundle URL:
 *    the event spans the whole script, not one module (module bodies
 *    are only registered at evaluate time and executed later), so the
 *    time goes to the bundle's `otherTime` bucket.
 *  - FunctionCall: args.data carries the definition site of the
 *    invoked function — resolve it to a module.
 *  - Any other event with a stack trace: the innermost frame with a
 *    URL decides — resolve when it is a bundle, skip the task when it
 *    points at code outside any bundle.
 *  - Tasks with no location of their own (layout, GC, microtasks
 *    triggered by module code) fall back to the inherited
 *    most-specific attributable URL; when that is a bundle the time
 *    is in-bundle but not attributable to one module → `otherTime`.
 *
 * Because only a task's own most-specific location (or the inherited
 * chain when it has none) is credited, the per-bundle sum of module
 * selfTime + otherTime is always ≤ that URL's total in cpu.urls,
 * which counts a task for every URL anywhere in its chain.
 *
 * Times are in ms rounded to one decimal, matching the sibling
 * analyses. Modules that round to 0 are dropped; bundles are sorted
 * by total time desc and modules by selfTime desc.
 */

import { compute } from './main-thread-tasks.js';

const WHOLE_SCRIPT_EVENTS = new Set([
  'EvaluateScript',
  'v8.compile',
  'v8.compileModule'
]);

function round(ms) {
  return Math.round(ms * 10) / 10;
}

function attributeTask(task, bundles) {
  const event = task.event;
  const argsData = (event.args && event.args.data) || {};

  if (WHOLE_SCRIPT_EVENTS.has(event.name)) {
    const url =
      event.name === 'v8.compileModule' ? event.args.fileName : argsData.url;
    return url && bundles.has(url) ? { url } : undefined;
  }

  if (event.name === 'FunctionCall' && argsData.url) {
    const bundle = bundles.get(argsData.url);
    if (!bundle) return;
    return {
      url: argsData.url,
      module: bundle.resolve(argsData.lineNumber, argsData.columnNumber)
    };
  }

  for (const frame of argsData.stackTrace || []) {
    if (!frame.url) continue;
    const bundle = bundles.get(frame.url);
    if (!bundle) return;
    return {
      url: frame.url,
      module: bundle.resolve(frame.lineNumber, frame.columnNumber)
    };
  }

  const inherited = task.attributableURLs.at(-1);
  return inherited && bundles.has(inherited) ? { url: inherited } : undefined;
}

/**
 * @param {Object} trace  Parsed Chrome trace.json (with .traceEvents).
 * @param {Map<string, {resolve: Function}>} bundles  Bundle URL →
 *   location resolver, built while collecting coverage.
 * @returns {Array<{url:string,
 *   modules:Array<{name:string, version:string, selfTime:number}>,
 *   otherTime:number}>}
 */
export function computeModuleCosts(trace, bundles) {
  if (!bundles || bundles.size === 0) return [];

  const byBundle = new Map();
  for (const task of compute(trace)) {
    if (!(task.selfTime > 0)) continue;
    const attribution = attributeTask(task, bundles);
    if (!attribution) continue;

    let entry = byBundle.get(attribution.url);
    if (!entry) {
      entry = { byModule: new Map(), otherTime: 0 };
      byBundle.set(attribution.url, entry);
    }
    const module = attribution.module;
    if (module) {
      const key = `${module.name}@${module.version}`;
      const moduleEntry = entry.byModule.get(key);
      if (moduleEntry) {
        moduleEntry.selfTime += task.selfTime;
      } else {
        entry.byModule.set(key, { ...module, selfTime: task.selfTime });
      }
    } else {
      entry.otherTime += task.selfTime;
    }
  }

  const result = [];
  for (const [url, entry] of byBundle) {
    const modules = [];
    let total = entry.otherTime;
    for (const moduleEntry of entry.byModule.values()) {
      total += moduleEntry.selfTime;
      moduleEntry.selfTime = round(moduleEntry.selfTime);
      if (moduleEntry.selfTime > 0) modules.push(moduleEntry);
    }
    modules.sort((a, b) => b.selfTime - a.selfTime);
    result.push({ url, modules, otherTime: round(entry.otherTime), total });
  }
  result.sort((a, b) => b.total - a.total);
  for (const entry of result) delete entry.total;
  return result;
}
