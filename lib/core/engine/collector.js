'use strict';
const forEach = require('lodash.foreach');
const chromeCPU = require('../../support/chromeCPU');
const ScreenshotManager = require('../../support/screenshot/');

/**
 * Create a new Collector instance. The collector will collect metrics
 * per iteration and store what's needed to disk.
 * @class
 */
class Collector {
  constructor(statistics, storageManager, options) {
    this.options = options;
    this.statistics = statistics;
    this.storageManager = storageManager;
    this.screenshotManager = new ScreenshotManager(storageManager, options);
    this.collectChromeTimeline =
      options.chrome &&
      options.chrome.collectTracingEvents &&
      options.chrome.collectCPUMetrics;
  }

  /**
   * Collect (and save) data per iteration
   * @param {*} data - The data collected by the browser for one iteration
   * @param {*} results - The result object where we put the data
   * @param {Integer} index - Which iteration it is
   */
  perIteration(data, results, index) {
    // From each iteration, collect the result we want
    results.timestamps.push(data.timestamp);
    results.browserScripts.push(data.browserScripts);
    // Add all browserscripts to the stats
    this.statistics.addDeep(data.browserScripts, (keyPath, value) => {
      if (keyPath.endsWith('userTimings.marks')) {
        return value.reduce((result, mark) => {
          result[mark.name] = mark.startTime;
          return result;
        }, {});
      } else if (keyPath.endsWith('userTimings.measure')) {
        return value.reduce((result, mark) => {
          result[mark.name] = mark.duration;
          return result;
        }, {});
      } else if (keyPath.endsWith('resourceTimings')) {
        return {};
      }
      return value;
    });

    if (data.visualMetrics) {
      results.visualMetrics.push(data.visualMetrics);
      this.statistics.addDeep({
        visualMetrics: data.visualMetrics
      });
    }

    // Put all work that involves storing metrics to disk in a
    // and array and the promise them all later on
    const extraWork = [];
    if (this.options.screenshot) {
      extraWork.push(
        this.screenshotManager.save(`screenshot-${index}`, data.screenshot)
      );
    }

    // Collect CPU data. There are some extra work going on here now
    // (we store the trace file twice)
    // in the future we could use the already stored trace log
    // but let us change that later on
    if (this.collectChromeTimeline) {
      extraWork.push(
        chromeCPU
          .get(
            data.extraJson[`trace-${index}.json`],
            this.storageManager.baseDir,
            index
          )
          .then(timelinesArray => {
            results.cpu.push(timelinesArray);
            this.statistics.addDeep({ cpu: timelinesArray });
            return Promise.resolve();
          })
      );
    }

    // Store all extra JSON metrics
    forEach(data.extraJson, (value, key) =>
      extraWork.push(this.storageManager.writeJson(key, value))
    );

    return Promise.all(extraWork);
  }
}

module.exports = Collector;
