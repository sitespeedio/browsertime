export class ChromeDevelopmentToolsProtocol {
    constructor(engineDelegate: any, browserName: any);
    engineDelegate: any;
    browserName: any;
    on(event: any, f: any): Promise<void>;
    sendAndGet(command: any, arguments_: any): Promise<any>;
    getRawClient(): any;
    send(command: any, arguments_: any): Promise<any>;
}
//# sourceMappingURL=chromeDevToolsProtocol.d.ts.map