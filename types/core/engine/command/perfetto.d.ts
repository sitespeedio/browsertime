export class PerfettoTrace {
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
    uploadConfigFile(android: any, config: any): Promise<any>;
    downloadTrace(): Promise<any>;
    /**
     * Begin Perfetto Trace Collection.
     *
     * @async
     * @returns {Promise<void>} A promise that resolves when tracing is finished.
     * @throws {Error} Throws an error if the configuration is not set for perfetto tracing.
     */
    start(config?: string): Promise<void>;
    android: Android;
    dataDir: any;
    running: boolean;
    /**
     * Stop Perfetto Trace Collection.
     *
     * @async
     * @returns {Promise<void>} A promise that resolves when tracing is finished and the perfetto
     *                          trace has been collected.
     * @throws {Error} Throws an error if the the perfetto session or trace was not found.
     */
    stop(): Promise<void>;
}
import { Android } from '../../../android/index.js';
//# sourceMappingURL=perfetto.d.ts.map