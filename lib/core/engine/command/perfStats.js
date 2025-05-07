import { PerfStats } from '../../../firefox/perfStats.js';
/**
 * Manages the PerfStats interface used for collecting Firefox performance counters.
 *
 * @class
 * @hideconstructor
 */

export class PerfStatsInterface {
  constructor(browser, options) {
    /**
     * @private
     */
    this.PerfStats = new PerfStats(browser);
    /**
     * @private
     */
    this.options = options;
  }

  /**
   * Starts PerfStats collection based on the given feature mask.
   *
   * @async
   * @returns {Promise<void>} A promise that resolves when collection has started.
   * @throws {Error} Throws an error if not running Firefox.
   */
  // eslint-disable-next-line prettier/prettier
  async start(featureMask = 0xFF_FF_FF_FF) {
    if (this.options.browser === 'firefox') {
      return this.PerfStats.start(featureMask);
    } else {
      throw new Error('PerfStats only works in Firefox');
    }
  }

  /**
   * Stops PerfStats collection.
   *
   * @async
   * @returns {Promise<void>} A promise that resolves when collection has stopped.
   * @throws {Error} Throws an error if not running Firefox.
   */
  async stop() {
    if (this.options.browser === 'firefox') {
      return this.PerfStats.stop();
    } else {
      throw new Error('PerfStats only works in Firefox');
    }
  }

  /**
   * Returns an object that has cumulative perfstats statistics across each
   * process for the features that were enabled. Should be called before stop().
   *
   * @async
   * @returns {Object} Returns an object with cumulative results.
   * @throws {Error} Throws an error if not running Firefox.
   */
  async collect() {
    if (this.options.browser === 'firefox') {
      return this.PerfStats.collect();
    } else {
      throw new Error('PerfStats only works in Firefox');
    }
  }
}
