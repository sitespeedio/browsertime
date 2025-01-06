import { performance } from 'node:perf_hooks';
import { getLogger } from '@sitespeed.io/log';
const log = getLogger('browsertime.command.stopwatch');

/**
 * A stopwatch utility for measuring time intervals.
 *
 * @class
 * @hideconstructor
 */
export class StopWatch {
  constructor(name, measure) {
    /**
     * @private
     */
    this.name = name;
    /**
     * @private
     */
    this.measure = measure;
    /**
     * @private
     */
    this.start = performance.now();
  }

  /**
   * Starts the stopwatch.
   */
  start() {
    this.start = performance.now();
  }

  /**
   * Stops the stopwatch and automatically adds the measured time to the
   * last measured page. Logs an error if no page has been measured.
   * @returns {number} The measured time in milliseconds.
   */
  stopAndAdd() {
    this.stop = performance.now();
    log.debug(`${this.name} time was ${this.stop - this.start} ms`);
    this.measure.add(this.name, this.stop - this.start);
    return this.stop - this.start;
  }

  /**
   * Stops the stopwatch.
   * @returns {number} The measured time in milliseconds.
   */
  stop() {
    this.stop = performance.now();
    log.debug(`${this.name} time was ${this.stop - this.start} ms`);
    return this.stop - this.start;
  }

  /**
   * Gets the name of the stopwatch.
   * @returns {string} The name of the stopwatch.
   */
  getName() {
    return this.name;
  }
}

/**
 * @private
 */
export class Watch {
  constructor(measure) {
    this.measure = measure;
  }

  /**
   * @private
   */
  get(name) {
    return new StopWatch(name, this.measure);
  }
}
