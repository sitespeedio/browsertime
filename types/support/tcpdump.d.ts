export class TCPDump {
    constructor(directory: any, options: any);
    baseDir: any;
    options: any;
    start(iteration: any): Promise<void>;
    tcpdumpProcess: any;
    stop(): Promise<void>;
    mv(url: any, iteration: any): Promise<void>;
}
//# sourceMappingURL=tcpdump.d.ts.map