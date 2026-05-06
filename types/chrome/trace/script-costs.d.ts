/**
 * @param {Object} trace  Parsed Chrome trace.json (with .traceEvents).
 * @returns {Array<{url:string, parse:number, compile:number,
 *                  execute:number, total:number}>}
 *   Per-URL JS cost in ms, sorted by total desc.
 */
export function computeScriptCosts(trace: any): Array<{
    url: string;
    parse: number;
    compile: number;
    execute: number;
    total: number;
}>;
//# sourceMappingURL=script-costs.d.ts.map