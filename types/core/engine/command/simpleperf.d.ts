export class SimplePerfProfiler {
    constructor(browser: any, index: any, storageManager: any, options: any);
    /**
     * @private
     */
    private browser;
    /**
     * @private
     */
    private storageManager;
    /**
     * @private
     */
    private options;
    /**
     * @private
     */
    private index;
    /**
     * @private
     */
    private running;
    /**
     * Start Simpleperf profiling.
     *
     * @async
     * @returns {Promise<void>} A promise that resolves when simpleperf has started profiling.
     * @throws {Error} Throws an error if app_profiler.py fails to execute.
     */
    start(profilerOptions?: any[], recordOptions?: string, dirName?: string): Promise<void>;
    dataDir: any;
    simpleperfProcess: import("execa").ResultPromise<{}>;
    /**
     * Stop Simpleperf profiling.
     *
     * @async
     * @returns {Promise<void>} A promise that resolves when simpleperf has stopped profiling
     *                          and collected profile data.
     * @throws {Error} Throws an error if app_profiler.py fails to execute.
     */
    stop(): Promise<void>;
}
//# sourceMappingURL=simpleperf.d.ts.map