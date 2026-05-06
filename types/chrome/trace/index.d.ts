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
export function computeMainThreadTasks(trace: any, options?: {
    flatten?: boolean;
}): Array<any>;
export { computeScriptCosts } from "./script-costs.js";
export { computeForcedReflows } from "./forced-reflows.js";
export { computeNonCompositedAnimations } from "./non-composited-animations.js";
//# sourceMappingURL=index.d.ts.map