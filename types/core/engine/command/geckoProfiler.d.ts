/**
 * Manages the Gecko Profiler for profiling Firefox performance.
 *
 * @class
 * @hideconstructor
 */
export class GeckoProfiler {
    constructor(GeckoProfiler: any, browser: any, index: any, options: any, result: any);
    /**
     * @private
     */
    private GeckoProfiler;
    /**
     * @private
     */
    private browser;
    /**
     * @private
     */
    private index;
    /**
     * @private
     */
    private options;
    /**
     * @private
     */
    private result;
    /**
     * Starts the Gecko Profiler.
     *
     * @async
     * @returns {Promise<void>} A promise that resolves when the profiler is started.
     * @throws {Error} Throws an error if not running Firefox or if the configuration is not set for custom profiling.
     */
    start(): Promise<void>;
    /**
     * Stops the Gecko Profiler and processes the collected data.
     *
     * @async
     * @returns {Promise<void>} A promise that resolves when the profiler is stopped and the data is processed.
     * @throws {Error} Throws an error if not running Firefox or if custom profiling was not started.
     */
    stop(): Promise<void>;
}
//# sourceMappingURL=geckoProfiler.d.ts.map