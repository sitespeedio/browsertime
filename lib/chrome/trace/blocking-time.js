/**
 * Blocking-time attribution per URL.
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
 * script-costs.js makes). Tasks where no node carries a URL go to the
 * 'unknown' bucket — that's browser-internal work (GC, style, layout
 * without a JS trigger) no script owns.
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
 *     beforeLargestContentfulPaint?: { totalBlockingTime, tasks,
 *                                      urls: [...] } }
 * Times in ms rounded to one decimal; url lists sorted by value desc
 * and noise-filtered to entries above 10 ms, matching cpu.urls.
 */

import { getMainThreadTasks } from './main-thread-tasks.js';
import { computeTraceOfTab } from './trace-of-tab.js';

const BLOCKING_THRESHOLD_MS = 50;
const REPORT_LIMIT_MS = 10;
const UNKNOWN = 'unknown';

function round(ms) {
  return Math.round(ms * 10) / 10;
}

function dominantUrl(task) {
  const selfTimeByUrl = new Map();
  const stack = [task];
  while (stack.length > 0) {
    const node = stack.pop();
    const url = node.attributableURLs.at(-1);
    if (url) {
      selfTimeByUrl.set(url, (selfTimeByUrl.get(url) || 0) + node.selfTime);
    }
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
  return bestUrl || UNKNOWN;
}

function newWindow() {
  return { totalBlockingTime: 0, tasks: 0, byUrl: new Map() };
}

function addToWindow(window, url, blocking) {
  window.totalBlockingTime += blocking;
  window.tasks += 1;
  let entry = window.byUrl.get(url);
  if (!entry) {
    entry = { url, value: 0, tasks: 0 };
    window.byUrl.set(url, entry);
  }
  entry.value += blocking;
  entry.tasks += 1;
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
  return {
    totalBlockingTime: round(window.totalBlockingTime),
    tasks: window.tasks,
    urls
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
    const url = dominantUrl(task);
    addToWindow(total, url, blocking);

    if (
      lcpEvent &&
      task.event.ts >= timestamps.navigationStart &&
      task.event.ts < lcpEvent.ts
    ) {
      addToWindow(beforeLcp, url, blocking);
    }
  }

  const result = finishWindow(total);
  if (lcpEvent) {
    result.beforeLargestContentfulPaint = finishWindow(beforeLcp);
  }
  return result;
}
