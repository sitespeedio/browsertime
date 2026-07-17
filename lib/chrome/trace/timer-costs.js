/**
 * Timer pressure per script — how much setTimeout/setInterval churn
 * a page runs, from trace events already collected with
 * --chrome.timeline.
 *
 * Two sides are joined per URL:
 *  - TimerInstall events (instant): who schedules timers, how many,
 *    how many with timeout 0 (the "yield" pattern that turns into
 *    main-thread machine-gunning) and how many recurring
 *    (setInterval / singleShot: false). Attribution from the
 *    innermost stack frame with a URL.
 *  - TimerFire tasks from the main-thread task tree: what running
 *    those timers actually cost. main-thread-tasks.js already chains
 *    TimerFire back to the installing script's URLs, so the cost
 *    lands on the script that scheduled the timer even when the
 *    callback is anonymous.
 *
 * Polling loops show up as a high install/fire count with recurring
 * installs on one URL; oversliced work shows up as hundreds of
 * timeout-0 installs. Fire time is inclusive task duration — what
 * the main thread was occupied with when the timer ran.
 *
 * Returns undefined when the trace has no timer events. Otherwise:
 *   { installs, fires, fireTime, timeoutZeroInstalls,
 *     recurringInstalls,
 *     byUrl: [{ url, installs, fires, fireTime,
 *               timeoutZeroInstalls, recurringInstalls }, …],
 *     sites: [{ url, line?, column?, functionName?, timeout,
 *               recurring, installs, fires, fireTime }, …] }
 * fireTime in ms with one decimal; byUrl sorted by fireTime desc,
 * capped at 10 entries with sub-0.1 ms/zero-install rows dropped.
 * `sites` lists the individual timers grouped by install site
 * (installer source position + timeout + kind) — the closest thing
 * to a timer's identity the trace offers — top 10 by fire time.
 * Positions are 1-based (trace stack-frame convention).
 */

import { compute } from './main-thread-tasks.js';

const MAX_URLS = 10;
const MAX_SITES = 10;
const UNKNOWN = 'unknown';

function round(ms) {
  return Math.round(ms * 10) / 10;
}

function installFrame(data) {
  for (const frame of data.stackTrace || []) {
    if (frame.url) return frame;
  }
}

export function computeTimerCosts(trace) {
  const byUrl = new Map();
  // Individual timers grouped by install site (installer source
  // position + timeout + kind): a polling loop reinstalling from the
  // same line collapses into one row with its install/fire counts.
  const bySite = new Map();
  const siteForTimerId = new Map();
  let installs = 0;
  let fires = 0;
  let fireTimeMs = 0;
  let timeoutZeroInstalls = 0;
  let recurringInstalls = 0;

  function entryFor(url) {
    let entry = byUrl.get(url);
    if (!entry) {
      entry = {
        url,
        installs: 0,
        fires: 0,
        fireTimeMs: 0,
        timeoutZeroInstalls: 0,
        recurringInstalls: 0
      };
      byUrl.set(url, entry);
    }
    return entry;
  }

  for (const event of trace.traceEvents) {
    if (event.name !== 'TimerInstall') continue;
    const data = (event.args && event.args.data) || {};
    const frame = installFrame(data);
    const entry = entryFor(frame ? frame.url : UNKNOWN);
    installs++;
    entry.installs++;
    const timeout = data.timeout || 0;
    if (timeout === 0) {
      timeoutZeroInstalls++;
      entry.timeoutZeroInstalls++;
    }
    const recurring = data.singleShot === false;
    if (recurring) {
      recurringInstalls++;
      entry.recurringInstalls++;
    }

    const siteKey = frame
      ? `${frame.url}|${frame.lineNumber}|${frame.columnNumber}|${timeout}|${recurring}`
      : `${UNKNOWN}|${timeout}|${recurring}`;
    let site = bySite.get(siteKey);
    if (!site) {
      site = {
        url: frame ? frame.url : UNKNOWN,
        timeout,
        recurring,
        installs: 0,
        fires: 0,
        fireTimeMs: 0
      };
      if (frame) {
        site.line = frame.lineNumber;
        site.column = frame.columnNumber;
        if (frame.functionName) site.functionName = frame.functionName;
      }
      bySite.set(siteKey, site);
    }
    site.installs++;
    if (data.timerId !== undefined) siteForTimerId.set(data.timerId, site);
  }

  const tasks = compute(trace);
  for (const task of tasks) {
    if (task.event.name !== 'TimerFire') continue;
    const entry = entryFor(task.attributableURLs.at(-1) || UNKNOWN);
    fires++;
    fireTimeMs += task.duration;
    entry.fires++;
    entry.fireTimeMs += task.duration;
    const fireData = (task.event.args && task.event.args.data) || {};
    const site = siteForTimerId.get(fireData.timerId);
    if (site) {
      site.fires++;
      site.fireTimeMs += task.duration;
    }
  }

  if (installs === 0 && fires === 0) return;

  const urls = [...byUrl.values()]
    .filter(entry => entry.fireTimeMs >= 0.1 || entry.installs > 0)
    .toSorted((a, b) => b.fireTimeMs - a.fireTimeMs || b.installs - a.installs)
    .slice(0, MAX_URLS)
    .map(entry => ({
      url: entry.url,
      installs: entry.installs,
      fires: entry.fires,
      fireTime: round(entry.fireTimeMs),
      timeoutZeroInstalls: entry.timeoutZeroInstalls,
      recurringInstalls: entry.recurringInstalls
    }));

  const sites = [...bySite.values()]
    .toSorted((a, b) => b.fireTimeMs - a.fireTimeMs || b.installs - a.installs)
    .slice(0, MAX_SITES)
    .map(site => {
      const published = {
        url: site.url,
        timeout: site.timeout,
        recurring: site.recurring,
        installs: site.installs,
        fires: site.fires,
        fireTime: round(site.fireTimeMs)
      };
      if (site.line !== undefined) published.line = site.line;
      if (site.column !== undefined) published.column = site.column;
      if (site.functionName) published.functionName = site.functionName;
      return published;
    });

  return {
    installs,
    fires,
    fireTime: round(fireTimeMs),
    timeoutZeroInstalls,
    recurringInstalls,
    byUrl: urls,
    sites
  };
}
