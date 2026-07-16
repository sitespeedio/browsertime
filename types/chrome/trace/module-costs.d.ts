/**
 * @param {Object} trace  Parsed Chrome trace.json (with .traceEvents).
 * @param {Map<string, {resolve: Function}>} bundles  Bundle URL →
 *   location resolver, built while collecting coverage.
 * @returns {Array<{url:string,
 *   modules:Array<{name:string, version:string, selfTime:number}>,
 *   otherTime:number}>}
 */
export function computeModuleCosts(trace: any, bundles: Map<string, {
    resolve: Function;
}>): Array<{
    url: string;
    modules: Array<{
        name: string;
        version: string;
        selfTime: number;
    }>;
    otherTime: number;
}>;
//# sourceMappingURL=module-costs.d.ts.map