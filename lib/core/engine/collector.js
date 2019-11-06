'use strict';
const forEach = require('lodash.foreach');
const get = require('lodash.get');
const version = require('../../../package').version;
const engineUtils = require('../../support/engineUtils');
const log = require('intel').getLogger('browsertime');
const Statistics = require('../../support/statistics').Statistics;
const pathToFolder = require('../../support/pathToFolder');
const path = require('path');

function getNewResult(url, options) {
  return {
    info: {
      browsertime: {
        version
      },
      url,
      timestamp: engineUtils.timestamp(),
      connectivity: {
        engine: get(options, 'connectivity.engine'),
        profile: get(options, 'connectivity.profile')
      }
    },
    files: {
      video: [],
      screenshot: [],
      timeline: [],
      consoleLog: [],
      netLog: [],
      perfLog: []
    },
    cdp: { performance: [] },
    timestamps: [],
    browserScripts: [],
    visualMetrics: [],
    cpu: [],
    extras: [],
    fullyLoaded: [],
    errors: []
  };
}
/**
 * Create a new Collector instance. The collector will collect metrics
 * per iteration and store what's needed to disk.
 * @class
 */
class Collector {
  constructor(url, storageManager, options) {
    this.options = options;
    this.storageManager = storageManager;
    this.collectChromeTimeline = options.chrome && options.chrome.timeline;
    this.allStats = {};
    this.allResults = {};
    this.aliasAndUrl = {};
    this.urlFromCli = url;
  }

  /**
   * Get the result from the collector. Will add and summarize all the statistics.
   * @returns {json} A JSON blob with all the collected metrics
   */
  getResults() {
    const allTheRuns = [];
    for (let url of Object.keys(this.allResults)) {
      const result = this.allResults[url];
      result.statistics = this.allStats[url].summarizeDeep(this.options);
      allTheRuns.push(result);
    }
    return allTheRuns;
  }

  /**
   * Back fill fully loaded metrics
   * @param {*} url
   * @param {*} fullyLoaded
   */
  addFullyLoaded(url, fullyLoaded) {
    const statistics = this.allStats[url];
    const results = this.allResults[url];
    if (results) {
      results.fullyLoaded.push(fullyLoaded);
    }
    if (fullyLoaded) {
      statistics.addDeep({
        timings: {
          fullyLoaded: fullyLoaded
        }
      });
    }
  }

  /**
   * Collect all individual runs, add it to the statistics, and store
   * data that needs to be on disk (trace logs, sceenshots etc).
   * @param {*} data - The data collected by the browser for one iteration
   */
  async perIteration(allData, index) {
    for (let data of allData) {
      const alias = data.alias;
      let url = data.url || this.urlFromCli;
      if (alias && !this.aliasAndUrl[alias]) {
        this.aliasAndUrl[alias] = url;
      } else if (alias && this.aliasAndUrl[alias]) {
        url = this.aliasAndUrl[alias];
      }

      const results = this.allResults[url]
        ? this.allResults[url]
        : getNewResult(url, this.options);
      results.info.description = allData.description;
      results.info.title = allData.title;
      // The user can add extra data in a script or post script
      if (data.extras) {
        results.extras.push(data.extras);
      }
      const statistics = this.allStats[url]
        ? this.allStats[url]
        : new Statistics();
      // If we don't have an error, use an empty array. In the future we want to push
      // more than one errors per run (maybe).
      results.errors.push(data.error || []);
      // From each iteration, collect the result we want
      results.timestamps.push(data.timestamp);
      if (data.browserScripts) {
        results.browserScripts.push(data.browserScripts);
        // Add all browserscripts to the stats
        statistics.addDeep(data.browserScripts, (keyPath, value) => {
          const equals = (a1, a2) => JSON.stringify(a1) === JSON.stringify(a2);
          if (equals(keyPath.slice(-2), ['userTimings', 'marks'])) {
            return value.reduce((result, mark) => {
              result[mark.name] = mark.startTime;
              return result;
            }, {});
          } else if (equals(keyPath.slice(-2), ['userTimings', 'measures'])) {
            return value.reduce((result, mark) => {
              result[mark.name] = mark.duration;
              return result;
            }, {});
          } else if (equals(keyPath.slice(-1), ['resourceTimings'])) {
            return {};
          }
          return value;
        });
      }

      if (data.alias) {
        results.info.alias = data.alias;
      }

      // Only availible for Chrome
      if (data.cdp && data.cdp.performance) {
        results.cdp.performance.push(data.cdp.performance);
        statistics.addDeep({
          cdp: { performance: data.cdp.performance }
        });
      }

      if (
        data.browserScripts &&
        data.browserScripts.timings &&
        data.browserScripts.timings.pageTimings &&
        this.options.iterations > 1
      ) {
        const pt = data.browserScripts.timings.pageTimings;
        log.info(
          `${url} BackEndTime: ${pt.backEndTime} DomInteractiveTime: ${
            pt.domInteractiveTime
          } DomContentLoadedTime: ${pt.domContentLoadedTime} FirstPaint: ${
            data.browserScripts.timings.firstPaint
              ? data.browserScripts.timings.firstPaint
              : '?'
          } PageLoadTime: ${pt.pageLoadTime}`
        );
      }

      if (data.visualMetrics) {
        if (this.options.iterations > 1) {
          log.info(
            `VisualMetrics FirstVisualChange: ${data.visualMetrics.FirstVisualChange} SpeedIndex: ${data.visualMetrics.SpeedIndex} PerceptualSpeedIndex: ${data.visualMetrics.PerceptualSpeedIndex} ContentfulSpeedIndex: ${data.visualMetrics.ContentfulSpeedIndex} LastVisualChange: ${data.visualMetrics.LastVisualChange}`
          );
        }
        results.visualMetrics.push(data.visualMetrics);
        statistics.addDeep({
          visualMetrics: data.visualMetrics
        });
      }
      // Put all work that involves storing metrics to disk in a
      // array and the promise them all later on
      const extraWork = [];

      if (
        data.browserScripts &&
        data.browserScripts.pageinfo &&
        data.browserScripts.pageinfo.longTask
      ) {
        for (let longTask of data.browserScripts.pageinfo.longTask) {
          statistics.addDeep({
            cpu: {
              longTasks: {
                durations: longTask.duration
              }
            }
          });
        }
      }

      // Add CPU data (if we have it)
      if (data.cpu) {
        results.cpu.push(data.cpu);
        // We skip adding stats per URL .., we should do it per domain instead in sitespeed.io
        if (data.cpu.categories) {
          statistics.addDeep({
            cpu: {
              categories: data.cpu.categories,
              events: data.cpu.events
            }
          });
        }
        if (data.cpu.longTasks) {
          statistics.addDeep({
            cpu: {
              longTasks: data.cpu.longTasks
            }
          });
        }
      }

      await this.storageManager.createSubDataDir(
        path.join(pathToFolder(url, this.options))
      );

      // Store all extra JSON metrics
      forEach(data.extraJson, (file, filename) =>
        extraWork.push(
          this.storageManager.writeJson(
            path.join(pathToFolder(url, this.options), filename),
            file,
            true
          )
        )
      );
      // Add path to files
      if (this.options.screenshot) {
        results.files.screenshot.push(
          `${pathToFolder(url, this.options)}screenshots/${index}.${
            this.options.screenshotParams.type
          }`
        );
      }
      if (this.options.video) {
        results.files.video.push(
          `${pathToFolder(url, this.options)}video/${index}.mp4`
        );
      }
      if (this.options.chrome && this.options.chrome.timeline) {
        results.files.timeline.push(
          `${pathToFolder(url, this.options)}trace-${index}.json.gz`
        );
      }
      if (this.options.chrome && this.options.chrome.collectConsoleLog) {
        results.files.consoleLog.push(
          `${pathToFolder(url, this.options)}console-${index}.json.gz`
        );
      }

      if (this.options.chrome && this.options.chrome.collectNetLog) {
        results.files.netLog.push(
          `${pathToFolder(url, this.options)}chromeNetlog-${index}.json.gz`
        );
      }

      if (this.options.chrome && this.options.chrome.collectPerfLog) {
        results.files.perfLog.push(
          `${pathToFolder(url, this.options)}chromePerflog-${index}.json.gz`
        );
      }

      await Promise.all(extraWork);
      this.allStats[url] = statistics;
      this.allResults[url] = results;
    }
  }
}

module.exports = Collector;
