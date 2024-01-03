export class GeckoProfiler {
    constructor(runner: any, storageManager: any, options: any);
    runner: any;
    storageManager: any;
    firefoxConfig: any;
    options: any;
    start(): Promise<any>;
    stop(index: any, url: any, result: any): Promise<void>;
    addMetaData(): void;
}
//# sourceMappingURL=geckoProfiler.d.ts.map