'use strict';

const log = require('intel').getLogger('browsertime.command.stopwatch');
const { performance } = require('perf_hooks');

class StopWatch {
  constructor(name, measure) {
    this.name = name;
    this.measure = measure;
    this.start = performance.now();
  }

  /**
   * Start the the stop watch
   */
  start() {
    this.start = performance.now();
  }

  /**
   * Stop the watch and automatically add the time to the
   * last measured page. If no page has been measured you will get
   * an error in your log.
   * @returns the measured time
   */
  stopAndAdd() {
    this.stop = performance.now();
    log.debug(`${this.name} time was ${this.stop - this.start} ms`);
    this.measure.add(this.name, this.stop - this.start);
    return this.stop - this.start;
  }

  /**
   * Stop the watch
   * @returns the measured time
   */
  stop() {
    this.stop = performance.now();
    log.debug(`${this.name} time was ${this.stop - this.start} ms`);
    return this.stop - this.start;
  }

  /**
   * Get the name of the watch.
   * @returns The name of the watch
   */
  getName() {
    return this.name;
  }
}

class Watch {
  constructor(measure) {
    this.measure = measure;
  }

  get(name) {
    return new StopWatch(name, this.measure);
  }
}
module.exports = Watch;
