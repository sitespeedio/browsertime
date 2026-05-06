export function getMainThreadTasks(traceEvents: any, traceEndTs: any): {
    event: any;
    startTime: any;
    endTime: any;
    parent: any;
    children: any[];
    attributableURLs: any[];
    group: {
        id: string;
        label: string;
        traceEventNames: string[];
    };
    duration: number;
    selfTime: number;
}[];
export function compute(trace: any): {
    event: any;
    startTime: any;
    endTime: any;
    parent: any;
    children: any[];
    attributableURLs: any[];
    group: {
        id: string;
        label: string;
        traceEventNames: string[];
    };
    duration: number;
    selfTime: number;
}[];
//# sourceMappingURL=main-thread-tasks.d.ts.map