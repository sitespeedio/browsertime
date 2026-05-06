/**
 * Forced reflow / synchronous layout detection.
 *
 * A forced reflow happens when JavaScript reads a layout-triggering
 * property (offsetTop, getBoundingClientRect, …) inside an event /
 * timer / animation-frame handler. The browser must synchronously
 * recompute layout to answer, blocking the main thread until it's
 * done. Classic perf-bug pattern; expensive on long DOM trees.
 *
 * In the trace this shows up as a Layout / UpdateLayoutTree event
 * nested inside a JS-driven task (EventDispatch, FunctionCall,
 * TimerFire, FireAnimationFrame, …). The unforced version of the
 * same event happens at the top level between tasks. So the rule is:
 * if the Layout's chain of ancestors includes any JS-driven task,
 * call it forced.
 *
 * Returns: [{ eventName, duration, startTime, triggeredBy,
 *             triggeredByUrl }, …]
 *   eventName       — Layout or UpdateLayoutTree
 *   duration / startTime — task timing in ms (already navstart-
 *                          relative from main-thread-tasks.js)
 *   triggeredBy     — the closest JS-driven ancestor's event name
 *                     (e.g. EventDispatch, FunctionCall)
 *   triggeredByUrl  — most-specific attributable URL of that
 *                     ancestor; the script the user can open and fix
 */

import { compute } from './main-thread-tasks.js';

const JS_DRIVEN = new Set([
  'EventDispatch',
  'EvaluateScript',
  'v8.evaluateModule',
  'FunctionCall',
  'TimerFire',
  'FireIdleCallback',
  'FireAnimationFrame',
  'RunMicrotasks',
  'V8.Execute'
]);

const LAYOUT_EVENTS = new Set(['Layout', 'UpdateLayoutTree']);

function urlFor(task) {
  if (!task || !task.attributableURLs) return '';
  return task.attributableURLs.at(-1) || '';
}

export function computeForcedReflows(trace) {
  const allTasks = compute(trace);
  const reflows = [];

  // Walk every task — `compute()` returns the flat list with
  // `.parent` linkage. For each Layout / UpdateLayoutTree, walk up
  // the parent chain to find the nearest JS-driven ancestor. If we
  // find one, the layout was forced.
  for (const task of allTasks) {
    if (!LAYOUT_EVENTS.has(task.event.name)) continue;

    let ancestor = task.parent;
    while (ancestor) {
      if (JS_DRIVEN.has(ancestor.event.name)) break;
      ancestor = ancestor.parent;
    }
    if (!ancestor) continue;

    reflows.push({
      eventName: task.event.name,
      duration: Math.round(task.duration * 10) / 10,
      startTime: Math.round(task.startTime * 10) / 10,
      triggeredBy: ancestor.event.name,
      triggeredByUrl: urlFor(ancestor)
    });
  }

  reflows.sort((a, b) => b.duration - a.duration);
  return reflows;
}
