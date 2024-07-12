export function start({ display, origin, size, filePath, offset, framerate, crf, nice, threads, taskset }: {
    display: any;
    origin: any;
    size: any;
    filePath: any;
    offset: any;
    framerate: any;
    crf: any;
    nice: any;
    threads: any;
    taskset: any;
}): Promise<{
    filePath: any;
    ffmpegProcess: import("execa").ResultPromise<any>;
}>;
export function stop(recording: any): Promise<any>;
//# sourceMappingURL=ffmpegRecorder.d.ts.map