export class IOSSimulatorRecorder {
    constructor(options: any, baseDir: any);
    options: any;
    tmpVideo: string;
    start(): Promise<void>;
    xcrunProcess: import("execa").ExecaChildProcess<string>;
    stop(destination: any): Promise<import("execa").ExecaReturnValue<string>>;
}
//# sourceMappingURL=recorder.d.ts.map