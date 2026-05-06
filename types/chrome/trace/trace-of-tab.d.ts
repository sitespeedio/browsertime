export function computeTraceOfTab(trace: any): {
    timings: {
        navigationStart: number;
        firstPaint: number;
        firstMeaningfulPaint: number;
        traceEnd: number;
        load: number;
        domContentLoaded: number;
    };
    timestamps: {
        navigationStart: any;
        firstPaint: any;
        firstMeaningfulPaint: any;
        traceEnd: any;
        load: any;
        domContentLoaded: any;
    };
    processEvents: any[];
    mainThreadEvents: any[];
    mainFrameIds: {
        pid: any;
        tid: any;
        frameId: any;
    };
    navigationStartEvt: any;
    firstPaintEvt: any;
    firstMeaningfulPaintEvt: any;
    loadEvt: any;
    domContentLoadedEvt: any;
    fmpFellBack: boolean;
};
//# sourceMappingURL=trace-of-tab.d.ts.map