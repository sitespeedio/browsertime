export class IOSRecorder {
    static activate(): Promise<NodeJS.WriteStream & {
        fd: 1;
    }>;
    constructor(options: any, baseDir: any);
    options: any;
    uuid: any;
    tmpVideo: string;
    tmpSound: string;
    start(): Promise<void>;
    qvhProcessProcess: import("execa").ExecaChildProcess<string>;
    stop(destination: any): Promise<import("execa").ExecaReturnValue<string>>;
}
//# sourceMappingURL=iosRecorder.d.ts.map