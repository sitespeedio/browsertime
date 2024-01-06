/**
 * Manages Chrome trace functionality, enabling custom profiling and trace collection in Chrome.
 *
 * @class
 * @hideconstructor
 */
export class ChromeTrace {
    constructor(engineDelegate: any, index: any, options: any, result: any);
    /**
     * @private
     */
    private engineDelegate;
    /**
     * @private
     */
    private options;
    /**
     * @private
     */
    private result;
    /**
     * @private
     */
    private index;
    /**
     * Starts the Chrome trace collection.
     *
     * @async
     * @example await commands.trace.start();
     * @returns {Promise<void>} A promise that resolves when tracing is started.
     * @throws {Error} Throws an error if not running Chrome or if configuration is not set for custom tracing.
     */
    start(): Promise<void>;
    /**
     * Stops the Chrome trace collection, processes the collected data, and attaches it to the result object.
     *
     * @async
     * @example await commands.trace.stop();
     * @returns {Promise<void>} A promise that resolves when tracing is stopped and data is processed.
     * @throws {Error} Throws an error if not running Chrome or if custom tracing was not started.
     */
    stop(): Promise<void>;
    events: any;
}
//# sourceMappingURL=chromeTrace.d.ts.map