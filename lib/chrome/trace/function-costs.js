/**
 * Per-function JS cost from the V8 sampling profiler
 * (disabled-by-default-v8.cpu_profiler, enabled on --enableProfileRun).
 * The task-based analyses (scriptCosts, moduleCosts) attribute
 * main-thread time to a URL or module; the sampled stacks answer the
 * next question — which function inside that script the time was
 * spent in.
 *
 * The category emits one Profile event per profiled V8 thread and a
 * stream of ProfileChunk events carrying incremental call-tree nodes,
 * sampled node ids and µs deltas between samples. Only the profile
 * started on the inspected tab's main thread is read: the Profile
 * event is emitted on the profiled thread, while its chunks arrive on
 * V8's sampling thread and are tied back via the shared profile id +
 * pid.
 *
 * Each sample's delta is credited as self time to the sampled frame
 * and as total time to every distinct frame on the sampled stack
 * (recursion counted once) — the definitions DevTools' bottom-up view
 * uses. Frames aggregate per function identity (name + script +
 * source position), so a function called from many sites is one row.
 *
 * V8 meta frames ((root), (program), (idle), (garbage collector))
 * carry codeType 'other' and are skipped — idle is not cost and GC is
 * already in cpu.categories. Engine frames without a script URL
 * (e.g. querySelectorAll) are kept: the cost is real, it just has no
 * source position.
 *
 * When the optional `bundles` map (url → location resolver, built by
 * the coverage path) knows a frame's URL, the frame's position is
 * resolved to the owning module inside the concatenated bundle and
 * reported as `module`. V8 call-frame positions are 0-based while the
 * resolvers — and the reported line/column — are 1-based (the trace
 * event / DevTools convention). Frame URLs longer than 1024 chars are
 * truncated by V8; they are recovered via unique prefix match against
 * the bundle map so the reported url matches cpu.urls / moduleCosts.
 *
 * Returns [{ functionName, url?, line?, column?, module?, selfTime,
 * totalTime }, …] in ms rounded to one decimal, sorted by selfTime
 * desc, noise-filtered to self time ≥ 1 ms and capped at 50 rows.
 * Empty array when the trace carries no profiler data (the category
 * is only enabled on profile runs).
 */

import { findMainFrameIds } from './tracing-processor.js';

const REPORT_LIMIT_US = 1000;
const MAX_FUNCTIONS = 50;
// V8 truncates callFrame.url in the trace (observed at 1024 chars),
// so long bundle URLs (MediaWiki load.php easily exceeds it) won't
// exact-match the coverage-path bundle map or the rest of the result.
const V8_URL_TRUNCATION_LIMIT = 1024;

function round(ms) {
  return Math.round(ms * 10) / 10;
}

function functionKey(callFrame) {
  return `${callFrame.functionName}|${callFrame.scriptId}|${callFrame.lineNumber}|${callFrame.columnNumber}`;
}

function isMetaFrame(callFrame) {
  return callFrame.codeType === 'other';
}

// Recover the full bundle URL + resolver for a (possibly truncated)
// frame URL. Exact match first; for truncation-length URLs fall back
// to a unique prefix match, skipping when ambiguous.
function findBundle(bundles, url) {
  if (!bundles || !url) return;
  const exact = bundles.get(url);
  if (exact) return { url, resolver: exact };
  if (url.length < V8_URL_TRUNCATION_LIMIT) return;
  let match;
  for (const [bundleUrl, resolver] of bundles) {
    if (bundleUrl.startsWith(url)) {
      if (match) return;
      match = { url: bundleUrl, resolver };
    }
  }
  return match;
}

export function computeFunctionCosts(trace, bundles) {
  const events = trace.traceEvents;
  const { pid, tid } = findMainFrameIds(events);

  const profileIds = new Set();
  for (const event of events) {
    if (event.name === 'Profile' && event.pid === pid && event.tid === tid) {
      profileIds.add(event.id);
    }
  }
  if (profileIds.size === 0) return [];

  const nodes = new Map();
  const samples = [];
  const timeDeltas = [];
  for (const event of events) {
    if (
      event.name !== 'ProfileChunk' ||
      event.pid !== pid ||
      !profileIds.has(event.id)
    ) {
      continue;
    }
    const data = event.args && event.args.data;
    if (!data) continue;
    const cpuProfile = data.cpuProfile;
    if (cpuProfile && cpuProfile.nodes) {
      for (const node of cpuProfile.nodes) nodes.set(node.id, node);
    }
    if (cpuProfile && cpuProfile.samples) samples.push(...cpuProfile.samples);
    if (data.timeDeltas) timeDeltas.push(...data.timeDeltas);
  }
  if (samples.length === 0) return [];

  // Lazily-named frames can miss their url; recover it from another
  // node in the same script.
  const scriptUrls = new Map();
  for (const node of nodes.values()) {
    const callFrame = node.callFrame;
    if (callFrame.url && callFrame.scriptId) {
      scriptUrls.set(callFrame.scriptId, callFrame.url);
    }
  }

  // Distinct function keys on each node's stack, for total time.
  const stackKeys = new Map();
  function keysForNode(nodeId) {
    const cached = stackKeys.get(nodeId);
    if (cached) return cached;
    const node = nodes.get(nodeId);
    if (!node) return new Set();
    const keys = new Set(node.parent ? keysForNode(node.parent) : undefined);
    if (!isMetaFrame(node.callFrame)) keys.add(functionKey(node.callFrame));
    stackKeys.set(nodeId, keys);
    return keys;
  }

  const functions = new Map();
  for (const node of nodes.values()) {
    const callFrame = node.callFrame;
    if (isMetaFrame(callFrame)) continue;
    const key = functionKey(callFrame);
    if (!functions.has(key)) {
      functions.set(key, { callFrame, selfUs: 0, totalUs: 0 });
    }
  }

  for (const [index, nodeId] of samples.entries()) {
    const delta = timeDeltas[index];
    // The first delta rebases against the profile start and can be
    // negative or missing; skip rather than credit negative time.
    if (!delta || delta <= 0) continue;
    const node = nodes.get(nodeId);
    if (!node) continue;
    if (!isMetaFrame(node.callFrame)) {
      functions.get(functionKey(node.callFrame)).selfUs += delta;
    }
    for (const key of keysForNode(nodeId)) {
      functions.get(key).totalUs += delta;
    }
  }

  const costs = [];
  for (const { callFrame, selfUs, totalUs } of functions.values()) {
    if (selfUs < REPORT_LIMIT_US) continue;
    const url = callFrame.url || scriptUrls.get(callFrame.scriptId) || '';
    const cost = {
      functionName: callFrame.functionName || '(anonymous)',
      selfTime: round(selfUs / 1000),
      totalTime: round(totalUs / 1000)
    };
    const bundle = findBundle(bundles, url);
    if (bundle) {
      cost.url = bundle.url;
    } else if (url) {
      cost.url = url;
    }
    if (callFrame.lineNumber !== undefined) {
      cost.line = callFrame.lineNumber + 1;
      cost.column =
        callFrame.columnNumber === undefined ? 1 : callFrame.columnNumber + 1;
      if (bundle) {
        const module_ = bundle.resolver.resolve(cost.line, cost.column);
        if (module_) cost.module = module_.name;
      }
    }
    costs.push(cost);
  }

  costs.sort((a, b) => b.selfTime - a.selfTime);
  return costs.slice(0, MAX_FUNCTIONS);
}
