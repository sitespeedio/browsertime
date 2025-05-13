/**
 * Manages the PerfStats interface used for collecting Firefox performance counters.
 *
 * @class
 * @hideconstructor
 */
export class PerfStatsInterface {
    constructor(browser: any, options: any);
    /**
     * @private
     */
    private PerfStats;
    /**
     * @private
     */
    private options;
    /**
     * Starts PerfStats collection based on the given feature mask.
     *
     * @async
     * @returns {Promise<void>} A promise that resolves when collection has started.
     * @throws {Error} Throws an error if not running Firefox.
     */
    start(featureMask?: number): Promise<void>;
    /**
     * Stops PerfStats collection.
     *
     * @async
     * @returns {Promise<void>} A promise that resolves when collection has stopped.
     * @throws {Error} Throws an error if not running Firefox.
     */
    stop(): Promise<void>;
    /**
     * Returns an object that has cumulative perfstats statistics across each
     * process for the features that were enabled. Should be called before stop().
     *
     * @async
     * @returns {Object} Returns an object with cumulative results.
     * @throws {Error} Throws an error if not running Firefox.
     */
    collect(): any;
}
//# sourceMappingURL=perfStats.d.ts.map