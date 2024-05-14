export class DesktopRecorder {
    constructor(options: any);
    display: any;
    framerate: any;
    nice: any;
    crf: any;
    convert: any;
    threads: any;
    viewPort: any;
    taskset: any;
    origin: string;
    offset: {
        x: number;
        y: number;
    };
    options: any;
    start(file: any): Promise<{
        filePath: any;
        ffmpegProcess: import("execa").ExecaChildProcess<string>;
    }>;
    filePath: any;
    recording: Promise<{
        filePath: any;
        ffmpegProcess: import("execa").ExecaChildProcess<string>;
    }>;
    stop(destination: any): Promise<void>;
}
//# sourceMappingURL=desktopRecorder.d.ts.map