import { getLogger } from '@sitespeed.io/log';

import {
  isResourceLoaderBundle,
  labelForUrl,
  resourceLoaderModuleCoverage,
  resourceLoaderLocationResolver
} from './mediawikiResourceLoader.js';

const log = getLogger('browsertime.chrome.coverage');

// Sum the union length of half-open [start, end) ranges. Used for the
// flat, non-nested ranges that CSS rule-usage tracking returns.
function unionLength(ranges) {
  if (ranges.length === 0) return 0;
  const sorted = ranges
    .map(r => [r.startOffset, r.endOffset])
    .toSorted((a, b) => a[0] - b[0]);
  let total = 0;
  let [curStart, curEnd] = sorted[0];
  for (let i = 1; i < sorted.length; i++) {
    const [s, e] = sorted[i];
    if (s <= curEnd) {
      if (e > curEnd) curEnd = e;
    } else {
      total += curEnd - curStart;
      curStart = s;
      curEnd = e;
    }
  }
  total += curEnd - curStart;
  return total;
}

// Paint a per-byte used/unused flag array for a script under detailed
// (block-level) V8 coverage. The CDP returns nested ranges: the outermost range is the
// function body and inner ranges are sub-blocks. An inner range with
// count == 0 inside a containing range with count > 0 represents dead
// code in an otherwise-executed function — those bytes must read as
// unused. A naive union of every range whose count > 0 is wrong: the
// outer range alone covers the entire function, so inner count == 0
// ranges get masked and zero-count branches disappear, making typical
// modern bundles look as if every byte was executed. Walk every range
// across every function from outermost to innermost (start ascending,
// length descending), painting a per-byte coverage flag; inner ranges
// overwrite outer ones, so the final flag at each byte reflects the
// innermost range's count.
export function paintJsCoverage(scriptCoverage, totalBytes) {
  const used = new Uint8Array(totalBytes);
  const ranges = [];
  for (const fn of scriptCoverage.functions) {
    for (const r of fn.ranges) {
      if (r.endOffset > r.startOffset) ranges.push(r);
    }
  }
  ranges.sort((a, b) =>
    a.startOffset === b.startOffset
      ? b.endOffset - a.endOffset
      : a.startOffset - b.startOffset
  );
  for (const r of ranges) {
    const start = Math.max(0, r.startOffset);
    const end = Math.min(totalBytes, r.endOffset);
    if (end > start) used.fill(r.count > 0 ? 1 : 0, start, end);
  }
  return used;
}

export function usedJsBytes(scriptCoverage, totalBytes) {
  const used = paintJsCoverage(scriptCoverage, totalBytes);
  let count = 0;
  for (let i = 0; i < totalBytes; i++) {
    if (used[i] === 1) count++;
  }
  return count;
}

function summarize(files) {
  let totalBytes = 0;
  let usedBytes = 0;
  for (const file of files) {
    totalBytes += file.totalBytes;
    usedBytes += file.usedBytes;
  }
  const unusedBytes = totalBytes - usedBytes;
  return {
    totalBytes,
    usedBytes,
    unusedBytes,
    unusedPercent: totalBytes > 0 ? (unusedBytes / totalBytes) * 100 : 0
  };
}

export class Coverage {
  constructor(cdp) {
    this.rawClient = cdp.getRawClient();
    this.started = false;
    this.styleSheetUrls = new Map();
    this.disposeStyleSheetListener = undefined;
  }

  async start() {
    const client = this.rawClient;
    this.styleSheetUrls.clear();
    this.disposeStyleSheetListener = client.CSS.styleSheetAdded(
      ({ header }) => {
        if (header && header.styleSheetId) {
          this.styleSheetUrls.set(
            header.styleSheetId,
            header.sourceURL || header.sourceMapURL || ''
          );
        }
      }
    );

    await client.Debugger.enable();
    await client.Profiler.enable();
    await client.DOM.enable();
    await client.CSS.enable();
    await client.Profiler.startPreciseCoverage({
      callCount: false,
      detailed: true,
      allowTriggeredUpdates: false
    });
    await client.CSS.startRuleUsageTracking();
    this.started = true;
  }

  async collect() {
    if (!this.started) return;
    const client = this.rawClient;

    let js;
    let css;
    // Bundle URL → source-location resolver for concatenated bundles
    // (MediaWiki ResourceLoader). Not part of the coverage result —
    // the caller hands it to the CPU trace parser so trace stack
    // frames can be attributed to individual modules.
    let resourceLoaderBundles;
    try {
      const jsResult = await client.Profiler.takePreciseCoverage();
      ({ js, resourceLoaderBundles } = await this.#processJs(
        jsResult.result || []
      ));
    } catch (error) {
      log.warn('Could not collect JS coverage: %s', error.message);
      js = {
        totalBytes: 0,
        usedBytes: 0,
        unusedBytes: 0,
        unusedPercent: 0,
        files: []
      };
    }

    try {
      const cssResult = await client.CSS.stopRuleUsageTracking();
      css = await this.#processCss(cssResult.ruleUsage || []);
    } catch (error) {
      log.warn('Could not collect CSS coverage: %s', error.message);
      css = {
        totalBytes: 0,
        usedBytes: 0,
        unusedBytes: 0,
        unusedPercent: 0,
        files: []
      };
    }

    try {
      await client.Profiler.stopPreciseCoverage();
    } catch {
      // ignore — collection already returned data
    }

    if (this.disposeStyleSheetListener) {
      this.disposeStyleSheetListener();
      this.disposeStyleSheetListener = undefined;
    }

    this.started = false;
    return { js, css, resourceLoaderBundles };
  }

  async #processJs(scripts) {
    const client = this.rawClient;
    const files = [];
    const resourceLoaderBundles = new Map();
    for (const script of scripts) {
      if (!script.url || !/^https?:/i.test(script.url)) {
        continue;
      }
      let source;
      try {
        const r = await client.Debugger.getScriptSource({
          scriptId: script.scriptId
        });
        source = r.scriptSource || '';
      } catch {
        continue;
      }
      const totalBytes = source.length;
      if (totalBytes === 0) continue;

      const usedBytes = usedJsBytes(script, totalBytes);
      const unusedBytes = totalBytes - usedBytes;
      const file = {
        url: script.url,
        totalBytes,
        usedBytes,
        unusedBytes,
        unusedPercent: (unusedBytes / totalBytes) * 100
      };
      const label = labelForUrl(script.url);
      if (label) file.label = label;
      if (isResourceLoaderBundle(script.url, source)) {
        const modules = resourceLoaderModuleCoverage(
          source,
          paintJsCoverage(script, totalBytes)
        );
        if (modules) {
          file.modules = modules;
          const resolver = resourceLoaderLocationResolver(source);
          if (resolver) resourceLoaderBundles.set(script.url, resolver);
        }
      }
      files.push(file);
    }
    return { js: { ...summarize(files), files }, resourceLoaderBundles };
  }

  async #processCss(ruleUsage) {
    const client = this.rawClient;
    const byStylesheet = new Map();
    for (const u of ruleUsage) {
      const list = byStylesheet.get(u.styleSheetId) || [];
      list.push(u);
      byStylesheet.set(u.styleSheetId, list);
    }
    const files = [];
    for (const [styleSheetId, usages] of byStylesheet) {
      let text;
      try {
        const r = await client.CSS.getStyleSheetText({ styleSheetId });
        text = r.text || '';
      } catch {
        continue;
      }
      const totalBytes = text.length;
      if (totalBytes === 0) continue;

      const usedBytes = unionLength(usages.filter(u => u.used));
      const unusedBytes = totalBytes - usedBytes;
      const url = this.styleSheetUrls.get(styleSheetId) || '';
      const file = {
        url,
        styleSheetId,
        totalBytes,
        usedBytes,
        unusedBytes,
        unusedPercent: (unusedBytes / totalBytes) * 100
      };
      const label = labelForUrl(url);
      if (label) file.label = label;
      files.push(file);
    }
    return { ...summarize(files), files };
  }
}
