'use strict';
const get = require('lodash.get');
const version = require('../../../package').version;
const engineUtils = require('../../support/engineUtils');
const log = require('intel').getLogger('browsertime');
const Statistics = require('../../support/statistics').Statistics;
const pathToFolder = require('../../support/pathToFolder');
const connectivity = require('../../connectivity/');
const { formatMetric } = require('../../support/util');
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
        profile: get(options, 'connectivity.profile'),
        settings: connectivity.getConnectivitySettings(options) || undefined
      },
      extra: JSON.parse(get(options, 'info.extra', '{}')),
      browser: { name: options.browser }
    },
    files: {
      video: [],
      screenshot: [],
      timeline: [],
      consoleLog: [],
      netLog: [],
      perfLog: [],
      geckoProfiles: [],
      memoryReports: []
    },
    markedAsFailure: 0,
    failureMessages: [],
    cdp: { performance: [] },
    android: { batteryTemperature: [], power: [] },
    timestamps: [],
    browserScripts: [],
    visualMetrics: [],
    deltaToTTFB: [],
    cpu: [],
    googleWebVitals: [],
    extras: [],
    fullyLoaded: [],
    mainDocumentTimings: [],
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
    this.urlAndActualUrl = {};
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
    // This is a hack if a URL change between runs. First try the
    // URL from cli/script, then the actual used.
    const statistics =
      this.allStats[url] || this.allStats[this.urlAndActualUrl[url]];
    const results =
      this.allResults[url] || this.allResults[this.urlAndActualUrl[url]];
    if (results) {
      results.fullyLoaded.push(fullyLoaded);
    }
    if (fullyLoaded) {
      if (statistics) {
        statistics.addDeep({
          timings: {
            fullyLoaded: fullyLoaded
          }
        });
      } else {
        log.error(
          'Could not add fullyLoaded metric to URL %s, we have statistic for the URLs %j ',
          url,
          Object.keys(this.allStats)
        );
      }
    }
  }

  addMainDocumentTimings(url, timings) {
    const statistics =
      this.allStats[url] || this.allStats[this.urlAndActualUrl[url]];
    const results =
      this.allResults[url] || this.allResults[this.urlAndActualUrl[url]];
    if (results) {
      results.mainDocumentTimings.push(timings);
    }
    if (timings && statistics) {
      statistics.addDeep({
        timings: {
          mainDocumentTimings: timings
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

      if (data.browserScripts && data.browserScripts.pageinfo) {
        const actualURL = data.browserScripts.pageinfo.url;
        // If the URL that we wanted to test do not match the actual URL used
        // which can happen in scripting when using alias and URLs has session etc in it
        if (url !== actualURL) {
          this.urlAndActualUrl[actualURL] = url;
        }
      }
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
      results.info.browser.userAgent = get(
        allData[0],
        'browserScripts.browser.userAgent',
        ''
      );

      if (allData.screenshots && allData.screenshots.length > 0) {
        results.files.screenshot.push(allData.screenshots);
      }

      const statistics = this.allStats[url]
        ? this.allStats[url]
        : new Statistics();

      // The user can add extra data in a script or post script
      if (data.extras) {
        results.extras.push(data.extras);
        statistics.addDeep({ extras: data.extras });
      }

      if (allData.batteryTemperature) {
        results.android.batteryTemperature.push(allData.batteryTemperature);
        statistics.addDeep({
          android: { batteryTemperature: allData.batteryTemperature }
        });
      }

      if (allData.markedAsFailure) {
        results.markedAsFailure = 1;
        results.failureMessages = allData.failureMessages;
      }

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

      if (this.options.iterations > 1) {
        const ttfb = get(
          data,
          'browserScripts.timings.pageTimings.backEndTime'
        );
        const domContentLoaded = get(
          data,
          'browserScripts.timings.pageTimings.domContentLoadedTime'
        );
        const firstPaint = get(data, 'browserScripts.timings.firstPaint');
        const fcp = get(
          data,
          "browserScripts.timings.paintTiming['first-contentful-paint']"
        );
        const pageLoadTime = get(
          data,
          'browserScripts.timings.pageTimings.pageLoadTime'
        );
        const lcp = get(
          data,
          'browserScripts.timings.largestContentfulPaint.renderTime'
        );
        const cls = get(data, 'browserScripts.pageinfo.cumulativeLayoutShift');
        const tbt = get(data, 'cpu.longTasks.totalBlockingTime');
        const mem = get(data, 'memory');

        log.info(
          `${url} ${ttfb ? formatMetric('TTFB', ttfb, false, true) + ' ' : ''}${
            domContentLoaded
              ? formatMetric(
                  'DOMContentLoaded',
                  domContentLoaded,
                  false,
                  true
                ) + ' '
              : ''
          }${
            firstPaint
              ? formatMetric('firstPaint', firstPaint, false, true) + ' '
              : ''
          }${fcp ? formatMetric('FCP', fcp, false, true) + ' ' : ''}${
            lcp ? formatMetric('LCP', lcp, false, true) + ' ' : ''
          }${
            pageLoadTime
              ? formatMetric('Load', pageLoadTime, false, true) + ' '
              : ''
          }${tbt ? formatMetric('TBT', tbt, false, true) + ' ' : ''}${
            cls ? 'CLS:' + cls.toFixed(4) : ''
          }${
            mem
              ? formatMetric(
                  'Memory',
                  Math.round(mem / 1024 / 1024),
                  false,
                  false
                ) + 'mb '
              : ''
          }`
        );
      }

      if (data.visualMetrics) {
        if (this.options.iterations > 1) {
          log.info(
            `VisualMetrics: ${formatMetric(
              'FirstVisualChange',
              data.visualMetrics.FirstVisualChange,
              false,
              true
            )} ${formatMetric(
              'SpeedIndex',
              data.visualMetrics.SpeedIndex,
              false,
              true
            )}${
              data.visualMetrics.PerceptualSpeedIndex
                ? formatMetric(
                    ' PerceptualSpeedIndex',
                    data.visualMetrics.PerceptualSpeedIndex,
                    false,
                    true
                  )
                : ''
            }${
              data.visualMetrics.ContentfulSpeedIndex
                ? formatMetric(
                    ' ContentfulSpeedIndex',
                    data.visualMetrics.ContentfulSpeedIndex,
                    false,
                    true
                  )
                : ''
            } ${formatMetric(
              'VisualComplete85',
              data.visualMetrics.VisualComplete85,
              false,
              true
            )} ${formatMetric(
              'LastVisualChange',
              data.visualMetrics.LastVisualChange,
              false,
              true
            )}`
          );
        }
        for (let key of Object.keys(data.visualMetrics)) {
          // Skip VisualProgress/ContentfulProgress etc
          if (key.indexOf('Progress') === -1) {
            const d = { visualMetrics: {} };
            d['visualMetrics'][key] = data.visualMetrics[key];
            statistics.addDeep(d);
          }
        }
        results.visualMetrics.push(data.visualMetrics);
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

      if (data.googleWebVitals) {
        results.googleWebVitals.push(data.googleWebVitals);
        statistics.addDeep({
          googleWebVitals: data.googleWebVitals
        });
      }

      if (data.renderBlocking) {
        if (!results.renderBlocking) {
          results.renderBlocking = [];
        }
        results.renderBlocking.push(data.renderBlocking);
      }

      // Add power data (if we have it)
      if (data.power) {
        results.android.power.push(data.power);
        statistics.addDeep({
          android: { power: data.power }
        });
      }

      // Add Firefox perfStats if available
      if (this.options.firefox && this.options.firefox.perfStats) {
        if (!results.geckoPerfStats) {
          results.geckoPerfStats = [];
        }
        results.geckoPerfStats.push(data.perfStats);
      }

      // Add total memory
      if (this.options.firefox && this.options.firefox.memoryReport) {
        statistics.addDeep({
          memory: data.memory
        });

        if (!results.memory) {
          results.memory = [];
        }
        results.memory.push(data.memory);
      }

      // Add delta to TTFB
      const deltaToTTFB = {};
      const fcp = get(
        data,
        "browserScripts.timings.paintTiming['first-contentful-paint']"
      );
      const ttfb = get(data, 'browserScripts.timings.ttfb');
      const lcp = get(
        data,
        'browserScripts.timings.largestContentfulPaint.renderTime'
      );
      const firstVisualChange = get(data, 'visualMetrics.FirstVisualChange');
      const lastVisualChange = get(data, 'visualMetrics.LastVisualChange');

      if (fcp) {
        deltaToTTFB['firstContentfulPaint'] = fcp - ttfb;
      }
      if (lcp) {
        deltaToTTFB['largestContentfulPaint'] = lcp - ttfb;
      }
      if (firstVisualChange) {
        deltaToTTFB['firstVisualChange'] = firstVisualChange - ttfb;
      }
      if (lastVisualChange) {
        deltaToTTFB['lastVisualChange'] = lastVisualChange - ttfb;
      }
      results.deltaToTTFB.push(deltaToTTFB);
      statistics.addDeep({ deltaToTFFB: deltaToTTFB });

      // Store all extra JSON metrics
      for (let filename of Object.keys(data.extraJson)) {
        extraWork.push(
          this.storageManager.writeJson(
            path.join(pathToFolder(url, this.options), filename),
            data.extraJson[filename],
            true
          )
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

      if (this.options.firefox && this.options.firefox.geckoProfiler) {
        results.files.geckoProfiles.push(
          `${pathToFolder(url, this.options)}geckoProfile-${index}.json.gz`
        );
      }

      if (this.options.firefox && this.options.firefox.memoryReport) {
        results.files.memoryReports.push(
          `${pathToFolder(url, this.options)}memory-report-${index}.json.gz`
        );
      }

      await Promise.all(extraWork);
      this.allStats[url] = statistics;
      this.allResults[url] = results;
    }
  }
}

module.exports = Collector;
