/**
 * Chrome trace.json analyses, used by parseCpuTrace.js to produce
 * the cpu/categories/events/urls payload that flows into the result
 * JSON. Replaces the legacy `@sitespeed.io/tracium` dependency
 * (extracted from Lighthouse 2017, unmaintained) with an in-tree
 * ESM port of the same algorithm. Kept byte-equivalent for
 * `computeMainThreadTasks` so existing consumers see the same task
 * tree; new analyses (script costs, layout shift attribution,
 * forced layouts, frame stability) will land here as additional
 * exports rather than a separate package.
 */

import { compute } from './main-thread-tasks.js';

export { computeScriptCosts } from './script-costs.js';
export { computeForcedReflows } from './forced-reflows.js';
export { computeNonCompositedAnimations } from './non-composited-animations.js';

/**
 * Compute the hierarchical main-thread task tree for a trace.
 * Each task has its kind classified into one of:
 *   parseHTML | styleLayout | paintCompositeRender |
 *   scriptParseCompile | scriptEvaluation | garbageCollection | other
 *
 * @param {Object} trace  Parsed Chrome trace.json (with .traceEvents).
 * @param {Object} [options]
 * @param {boolean} [options.flatten=false]  When true, return all
 *   tasks flat (parents and children); when false, only top-level.
 * @returns {Array<Object>}
 */
export function computeMainThreadTasks(trace, options = {}) {
  const { flatten = false } = options;
  const allTasks = compute(trace);
  const result = [];
  for (const task of allTasks) {
    task.kind = task.group.id;
    delete task.group;
    if (!task.parent || flatten) result.push(task);
  }
  return result;
}
