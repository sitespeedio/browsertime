/**
 * Per-script JS cost breakdown — the same data Lighthouse's
 * `bootup-time` audit computes, surfaced as a structured array so
 * downstream consumers can render a "top scripts by main-thread
 * time" table without re-deriving it from raw tasks.
 *
 * For each attributable URL we sum the self-time of every main-thread
 * task that's classified as parse / compile / execute, and return:
 *   [{ url, parse, compile, execute, total }, …]
 *
 * Reference: Lighthouse `lighthouse-core/audits/bootup-time.js`.
 *
 * Times are in ms, rounded to one decimal. Sorted by `total` desc so
 * the worst offenders are at index 0.
 */

import { compute } from './main-thread-tasks.js';

// Trace event name → cost bucket. Built once at module-load time so
// the inner hot loop is a single Map.get per task.
const PARSE_EVENTS = new Set(['v8.parseOnBackground']);
const COMPILE_EVENTS = new Set(['v8.compile', 'v8.compileModule']);
const EXECUTE_EVENTS = new Set([
  'EvaluateScript',
  'v8.evaluateModule',
  'FunctionCall',
  'TimerFire',
  'FireIdleCallback',
  'FireAnimationFrame',
  'RunMicrotasks',
  'V8.Execute',
  'EventDispatch'
]);

function bucketFor(eventName) {
  if (PARSE_EVENTS.has(eventName)) return 'parse';
  if (COMPILE_EVENTS.has(eventName)) return 'compile';
  if (EXECUTE_EVENTS.has(eventName)) return 'execute';
  return;
}

function round(ms) {
  return Math.round(ms * 10) / 10;
}

/**
 * @param {Object} trace  Parsed Chrome trace.json (with .traceEvents).
 * @returns {Array<{url:string, parse:number, compile:number,
 *                  execute:number, total:number}>}
 *   Per-URL JS cost in ms, sorted by total desc.
 */
export function computeScriptCosts(trace) {
  const allTasks = compute(trace);
  const byUrl = new Map();

  for (const task of allTasks) {
    const bucket = bucketFor(task.event.name);
    if (!bucket) continue;

    // Lighthouse credits the most-specific URL in the attributable
    // chain (the innermost stack frame / target script). For an event
    // like EvaluateScript this is the URL of the script being
    // evaluated; for FunctionCall it's the script the function lives
    // in. attributableURLs is built bottom-up so the last element is
    // the right one.
    const url = task.attributableURLs.at(-1);
    if (!url) continue;

    let entry = byUrl.get(url);
    if (!entry) {
      entry = { url, parse: 0, compile: 0, execute: 0, total: 0 };
      byUrl.set(url, entry);
    }
    entry[bucket] += task.selfTime;
    entry.total += task.selfTime;
  }

  const result = [];
  for (const entry of byUrl.values()) {
    entry.parse = round(entry.parse);
    entry.compile = round(entry.compile);
    entry.execute = round(entry.execute);
    entry.total = round(entry.total);
    result.push(entry);
  }
  result.sort((a, b) => b.total - a.total);
  return result;
}
