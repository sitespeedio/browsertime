'use strict';
const forEach = require('lodash.foreach');
const chromeCPU = require('../../support/chromeCPU');

/**
 * Create a new Collector instance. The collector will collect metrics
 * per run and store what's needed to disk.
 * @class
 */
class Collector {
  constructor(statistics, storageManager, options) {
    this.options = options;
    this.statistics = statistics;
    this.storageManager = storageManager;
    this.collectChromeTimeline =
      options.chrome &&
      options.chrome.collectTracingEvents &&
      options.chrome.collectCPUMetrics;
  }

  /**
   * Collect (and save) data per run
   * @param {*} iterationData - The data collected by the browser for one run
   * @param {*} results - The result object where we put the data
   * @param {Integer} runIndex - Which run it is
   */
  perRun(iterationData, results, runIndex) {
    // From each run, collect the result we want
    results.timestamps.push(iterationData.timestamp);
    results.browserScripts.push(iterationData.browserScripts);
    // Add all browserscripts to the stats
    this.statistics.addDeep(iterationData.browserScripts, (keyPath, value) => {
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

    if (iterationData.visualMetrics) {
      results.visualMetrics.push(iterationData.visualMetrics);
      this.statistics.addDeep({
        visualMetrics: iterationData.visualMetrics
      });
    }

    // Put all work that involves storing metrics to disk in a
    // and array and the promise them all later on
    const extraWork = [];
    if (this.options.screenshot) {
      extraWork.push(
        this.storageManager.writeData(
          `screenshot-${runIndex}.png`,
          iterationData.screenshot
        )
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
            iterationData.extraJson[`trace-${runIndex}.json`],
            this.storageManager.baseDir,
            runIndex
          )
          .then(timelinesArray => {
            results.cpu.push(timelinesArray);
            this.statistics.addDeep({ cpu: timelinesArray });
            return Promise.resolve();
          })
      );
    }

    // Store all extra JSON metrics
    forEach(iterationData.extraJson, (value, key) =>
      extraWork.push(this.storageManager.writeJson(key, value))
    );

    return Promise.all(extraWork);
  }
}

module.exports = Collector;
