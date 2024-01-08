export class TCPDump {
    constructor(directory: any, options: any);
    baseDir: any;
    options: any;
    start(iteration: any): Promise<void>;
    tcpdumpProcess: import("execa").ExecaChildProcess<string>;
    stop(): Promise<import("execa").ExecaReturnValue<string>>;
    mv(url: any, iteration: any): Promise<void>;
}
//# sourceMappingURL=tcpdump.d.ts.map