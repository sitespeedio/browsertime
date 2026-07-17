/**
 * Blocking-time attribution per URL and per kind of work.
 *
 * A top-level main-thread task longer than 50 ms blocks input for
 * (duration - 50) ms — the same definition Lighthouse's Total
 * Blocking Time uses. Knowing the page's TBT is one thing; knowing
 * WHICH script produced it is what tells you what to fix first, so
 * each blocking task is attributed to a URL:
 *
 * Top-level tasks are often anonymous wrappers (RunTask et al.) whose
 * own attributableURLs is empty while the real work sits in child
 * tasks. So instead of only looking at the top-level task's own URL
 * chain, the whole subtree is walked and the task is attributed to
 * the URL that contributed the most self-time (each node credited to
 * its most-specific URL, attributableURLs.at(-1), the same choice
 * script-costs.js makes). ParseHTML nodes carry no attributable URL
 * (main-thread-tasks.js only reads URLs from script events and stack
 * frames, and stays byte-equivalent for cpu.urls consumers), so here
 * they fall back to the document URL in args.beginData.url — a page
 * blocked by parsing its own big HTML gets attributed to that
 * document instead of disappearing. Tasks where no node carries any
 * URL go to the 'unknown' bucket — browser-internal work (GC, style,
 * layout without a JS trigger) no script owns.
 *
 * Blocking time is also split by KIND of work: each blocking task's
 * subtree self-time per task group (parseHTML, styleLayout,
 * scriptEvaluation, …) is scaled to the task's blocking share and
 * summed per window into `kinds`. The per-URL list says who to blame;
 * the kinds split says what kind of fix applies — script blocking
 * needs code changes, parse/style blocking needs a smaller document
 * or cheaper CSS.
 *
 * Two windows are reported: the whole trace, and navigationStart →
 * the last largestContentfulPaint::Candidate event (blocking time in
 * that window is what delayed LCP). Task times from
 * main-thread-tasks.js are ms rebased to the first task, while the
 * navigationStart / LCP timestamps are raw trace µs — the window
 * check therefore uses the task's raw event.ts instead of converting
 * back and forth. When the trace has no LCP candidate the LCP window
 * is omitted rather than guessed.
 *
 * Returns:
 *   { totalBlockingTime, tasks, urls: [{ url, value, tasks }, …],
 *     kinds: { styleLayout: ms, … },
 *     beforeLargestContentfulPaint?: { totalBlockingTime, tasks,
 *                                      urls: [...], kinds: {...} } }
 * Times in ms rounded to one decimal; url lists sorted by value desc
 * and noise-filtered to entries above 10 ms, matching cpu.urls.
 * Kinds that round to 0 ms are omitted.
 */

import { getMainThreadTasks } from './main-thread-tasks.js';
import { computeTraceOfTab } from './trace-of-tab.js';

const BLOCKING_THRESHOLD_MS = 50;
const REPORT_LIMIT_MS = 10;
const UNKNOWN = 'unknown';

function round(ms) {
  return Math.round(ms * 10) / 10;
}

function nodeUrl(node) {
  const url = node.attributableURLs.at(-1);
  if (url) return url;
  if (node.event.name === 'ParseHTML') {
    const beginData = node.event.args && node.event.args.beginData;
    return beginData && beginData.url;
  }
}

// One subtree walk computing both attributions for a blocking task:
// the dominant URL (most self-time) and the self-time per task kind.
function analyzeTask(task) {
  const selfTimeByUrl = new Map();
  const selfTimeByKind = new Map();
  const stack = [task];
  while (stack.length > 0) {
    const node = stack.pop();
    const url = nodeUrl(node);
    if (url) {
      selfTimeByUrl.set(url, (selfTimeByUrl.get(url) || 0) + node.selfTime);
    }
    const kind = node.group.id;
    selfTimeByKind.set(kind, (selfTimeByKind.get(kind) || 0) + node.selfTime);
    stack.push(...node.children);
  }
  let bestUrl;
  let bestTime = 0;
  for (const [url, time] of selfTimeByUrl) {
    if (time > bestTime) {
      bestUrl = url;
      bestTime = time;
    }
  }
  return { url: bestUrl || UNKNOWN, selfTimeByKind };
}

function newWindow() {
  return {
    totalBlockingTime: 0,
    tasks: 0,
    byUrl: new Map(),
    byKind: new Map()
  };
}

function addToWindow(window, task, blocking, analysis) {
  window.totalBlockingTime += blocking;
  window.tasks += 1;
  let entry = window.byUrl.get(analysis.url);
  if (!entry) {
    entry = { url: analysis.url, value: 0, tasks: 0 };
    window.byUrl.set(analysis.url, entry);
  }
  entry.value += blocking;
  entry.tasks += 1;
  // Scale each kind's subtree self-time to the task's blocking share,
  // so the kinds sum to totalBlockingTime instead of raw durations.
  for (const [kind, selfTime] of analysis.selfTimeByKind) {
    const share = (selfTime / task.duration) * blocking;
    window.byKind.set(kind, (window.byKind.get(kind) || 0) + share);
  }
}

function finishWindow(window) {
  const urls = [];
  for (const entry of window.byUrl.values()) {
    if (entry.value > REPORT_LIMIT_MS) {
      entry.value = round(entry.value);
      urls.push(entry);
    }
  }
  urls.sort((a, b) => b.value - a.value);
  const kinds = {};
  for (const [kind, value] of [...window.byKind.entries()].toSorted(
    (a, b) => b[1] - a[1]
  )) {
    const rounded = round(value);
    if (rounded > 0) kinds[kind] = rounded;
  }
  return {
    totalBlockingTime: round(window.totalBlockingTime),
    tasks: window.tasks,
    urls,
    kinds
  };
}

export function computeBlockingTime(trace) {
  const { mainThreadEvents, timestamps } = computeTraceOfTab(trace);
  const tasks = getMainThreadTasks(mainThreadEvents, timestamps.traceEnd);

  let lcpEvent;
  for (const event of trace.traceEvents) {
    if (
      event.name === 'largestContentfulPaint::Candidate' &&
      (!lcpEvent || event.ts > lcpEvent.ts)
    ) {
      lcpEvent = event;
    }
  }

  const total = newWindow();
  const beforeLcp = newWindow();

  for (const task of tasks) {
    if (task.parent) continue;
    if (task.duration <= BLOCKING_THRESHOLD_MS) continue;

    const blocking = task.duration - BLOCKING_THRESHOLD_MS;
    const analysis = analyzeTask(task);
    addToWindow(total, task, blocking, analysis);

    if (
      lcpEvent &&
      task.event.ts >= timestamps.navigationStart &&
      task.event.ts < lcpEvent.ts
    ) {
      addToWindow(beforeLcp, task, blocking, analysis);
    }
  }

  const result = finishWindow(total);
  if (lcpEvent) {
    result.beforeLargestContentfulPaint = finishWindow(beforeLcp);
  }
  return result;
}
