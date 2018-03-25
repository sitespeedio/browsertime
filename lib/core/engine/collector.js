'use strict';
const forEach = require('lodash.foreach');
const get = require('lodash.get');
const version = require('../../../package').version;
const engineUtils = require('../../support/engineUtils');
const log = require('intel');
const { parseCpuTrace } = require('../../chrome/cpu');
const Statistics = require('../../support/statistics').Statistics;
const ScreenshotManager = require('../../screenshot/');

/**
 * Create a new Collector instance. The collector will collect metrics
 * per iteration and store what's needed to disk.
 * @class
 */
class Collector {
  constructor(url, storageManager, options) {
    this.options = options;
    this.storageManager = storageManager;
    this.screenshotManager = new ScreenshotManager(storageManager, options);
    this.collectChromeTimeline =
      options.chrome &&
      options.chrome.collectTracingEvents &&
      options.chrome.collectCPUMetrics;
    this.statistics = new Statistics();
    // Put all the result from the iterations here
    this.results = {
      info: {
        browsertime: {
          version
        },
        url,
        timestamp: engineUtils.timestamp(),
        connectivity: {
          engine: get(this.options, 'connectivity.engine'),
          profile: get(this.options, 'connectivity.profile')
        }
      },
      timestamps: [],
      browserScripts: [],
      visualMetrics: [],
      cpu: [],
      errors: []
    };
  }

  /**
   * Get the result from the collector. Will add and summarize all the statistics.
   * @returns {json} A JSON blob with all the collected metrics
   */
  getResults() {
    this.results.statistics = this.statistics.summarizeDeep(this.options);
    return this.results;
  }

  /**
   * Collect all individual runs, add it to the statistics, and store
   * data that needs to be on disk (trace logs, sceenshots etc).
   * @param {*} data - The data collected by the browser for one iteration
   * @param {Integer} index - Which iteration it is
   */
  async perIteration(data, index) {
    const results = this.results;
    const statistics = this.statistics;
    // FIXME should this add when there's no errors?
    results.errors.push(data.error);
    // From each iteration, collect the result we want
    results.timestamps.push(data.timestamp);
    if (data.browserScripts) {
      results.browserScripts.push(data.browserScripts);
      // Add all browserscripts to the stats
      statistics.addDeep(data.browserScripts, (keyPath, value) => {
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
    }

    if (data.visualMetrics && this.options.iterations > 1) {
      log.info(
        `VisualMetrics FirstVisualChange: ${
          data.visualMetrics.FirstVisualChange
        } SpeedIndex: ${data.visualMetrics.SpeedIndex} PerceptualSpeedIndex: ${
          data.visualMetrics.PerceptualSpeedIndex
        } LastVisualChange: ${data.visualMetrics.LastVisualChange}
        `
      );
      results.visualMetrics.push(data.visualMetrics);
      statistics.addDeep({
        visualMetrics: data.visualMetrics
      });
    }

    // Put all work that involves storing metrics to disk in a
    // array and the promise them all later on
    const extraWork = [];
    if (this.options.screenshot && data.screenshot) {
      extraWork.push(this.screenshotManager.save(`${index}`, data.screenshot));
    }

    // Collect CPU data. There are some extra work going on here now
    // (we store the trace file twice)
    // in the future we could use the already stored trace log
    // but let us change that later on
    if (this.collectChromeTimeline) {
      extraWork.push(
        parseCpuTrace(
          data.extraJson[`trace-${index}.json`],
          this.storageManager.baseDir,
          index
        )
          .then(timelineData => {
            results.cpu.push(timelineData);
            statistics.addDeep({ cpu: timelineData });
          })
          .catch(e => {
            log.warning('Failed to parse CPU usage from Chrome.', e);
            throw e;
          })
      );
    }

    // Store all extra JSON metrics
    forEach(data.extraJson, (file, filename) =>
      extraWork.push(this.storageManager.writeJson(filename, file, true))
    );

    return Promise.all(extraWork);
  }
}

module.exports = Collector;
