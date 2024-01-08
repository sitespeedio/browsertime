/**
 * A stopwatch utility for measuring time intervals.
 *
 * @class
 * @hideconstructor
 */
export class StopWatch {
    constructor(name: any, measure: any);
    /**
     * @private
     */
    private name;
    /**
     * @private
     */
    private measure;
    /**
     * Starts the stopwatch.
     */
    start(): void;
    /**
     * Stops the stopwatch and automatically adds the measured time to the
     * last measured page. Logs an error if no page has been measured.
     * @returns {number} The measured time in milliseconds.
     */
    stopAndAdd(): number;
    /**
     * Stops the stopwatch.
     * @returns {number} The measured time in milliseconds.
     */
    stop(): number;
    /**
     * Gets the name of the stopwatch.
     * @returns {string} The name of the stopwatch.
     */
    getName(): string;
}
/**
 * @private
 */
export class Watch {
    constructor(measure: any);
    measure: any;
    /**
     * @private
     */
    private get;
}
//# sourceMappingURL=stopWatch.d.ts.map