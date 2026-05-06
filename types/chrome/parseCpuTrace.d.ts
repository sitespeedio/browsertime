export function parseCPUTrace(tracelog: any, url: any): Promise<{
    categories: {
        parseHTML: number;
        styleLayout: number;
        paintCompositeRender: number;
        scriptParseCompile: number;
        scriptEvaluation: number;
        garbageCollection: number;
        other: number;
    };
    events: {};
    urls: {
        url: string;
        value: number;
    }[];
    scriptCosts: any[];
    forcedReflows: any[];
    nonCompositedAnimations: any[];
} | {
    categories?: undefined;
    events?: undefined;
    urls?: undefined;
    scriptCosts?: undefined;
    forcedReflows?: undefined;
    nonCompositedAnimations?: undefined;
}>;
//# sourceMappingURL=parseCpuTrace.d.ts.map