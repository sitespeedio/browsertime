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
} | {
    categories?: undefined;
    events?: undefined;
    urls?: undefined;
}>;
//# sourceMappingURL=parseCpuTrace.d.ts.map