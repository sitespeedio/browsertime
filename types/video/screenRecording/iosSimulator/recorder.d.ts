export class IOSSimulatorRecorder {
    constructor(options: any, baseDir: any);
    options: any;
    tmpVideo: string;
    start(): Promise<void>;
    xcrunProcess: import("execa").ResultPromise<{
        shell: true;
    }>;
    stop(destination: any): Promise<import("execa").Result<{
        shell: true;
    }>>;
}
//# sourceMappingURL=recorder.d.ts.map