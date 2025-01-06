import { getLogger } from '@sitespeed.io/log';
const log = getLogger('browsertime.command.geckoprofiler');
/**
 * Manages the Gecko Profiler for profiling Firefox performance.
 *
 * @class
 * @hideconstructor
 */

export class GeckoProfiler {
  constructor(GeckoProfiler, browser, index, options, result) {
    /**
     * @private
     */
    this.GeckoProfiler = GeckoProfiler;
    /**
     * @private
     */
    this.browser = browser;
    /**
     * @private
     */
    this.index = index;
    /**
     * @private
     */
    this.options = options;
    /**
     * @private
     */
    this.result = result;
  }

  /**
   * Starts the Gecko Profiler.
   *
   * @async
   * @returns {Promise<void>} A promise that resolves when the profiler is started.
   * @throws {Error} Throws an error if not running Firefox or if the configuration is not set for custom profiling.
   */
  async start() {
    if (this.options.browser === 'firefox') {
      if (this.options.firefox.geckoProfilerRecordingType === 'custom') {
        return this.GeckoProfiler.start();
      } else {
        log.info(
          'You need to set geckoProfilerRecordingType to custom to turn on the profiler in scripting'
        );
      }
    } else {
      throw new Error('Geckoprofiler only works in Firefox');
    }
  }

  /**
   * Stops the Gecko Profiler and processes the collected data.
   *
   * @async
   * @returns {Promise<void>} A promise that resolves when the profiler is stopped and the data is processed.
   * @throws {Error} Throws an error if not running Firefox or if custom profiling was not started.
   */
  async stop() {
    if (this.options.browser === 'firefox') {
      if (this.options.firefox.geckoProfilerRecordingType === 'custom') {
        return this.GeckoProfiler.stop(
          this.index,
          this.result[0].url,
          this.result
        );
      }
    } else {
      throw new Error('Geckoprofiler only works in Firefox');
    }
  }
}
