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
    this.startTime = performance.now();
  }

  /**
   * Starts the stopwatch.
   */
  start() {
    this.startTime = performance.now();
  }

  /**
   * Stops the stopwatch and automatically adds the measured time to the
   * last measured page. Logs an error if no page has been measured.
   * @returns {number} The measured time in milliseconds.
   */
  stopAndAdd() {
    this.stopTime = performance.now();
    log.debug(`${this.name} time was ${this.stopTime - this.startTime} ms`);
    this.measure.add(this.name, this.stopTime - this.startTime);
    return this.stopTime - this.startTime;
  }

  /**
   * Stops the stopwatch.
   * @returns {number} The measured time in milliseconds.
   */
  stop() {
    this.stopTime = performance.now();
    log.debug(`${this.name} time was ${this.stopTime - this.startTime} ms`);
    return this.stopTime - this.startTime;
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
