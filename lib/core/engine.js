'use strict';

const Promise = require('bluebird');
const log = require('intel');
const merge = require('lodash.merge');
const version = require('../../package').version;
const Statistics = require('../support/statistics').Statistics;
const StorageManager = require('../support/storageManager');
const engineDelegate = require('./engineDelegate');
const SeleniumRunner = require('./seleniumRunner');
const webdriver = require('selenium-webdriver');
const UrlLoadError = require('../support/errors').UrlLoadError;
const startVideo = require('../support/video/scripts/startVideo');
const startVideoAndroid = require('../support/video/scripts/startVideoAndroid');
const pullNetLogAndroid = require('../support/pullNetLogAndroid');
const stopVideo = require('../support/video/scripts/stopVideo');
const stopVideoAndroid = require('../support/video/scripts/stopVideoAndroid');
const runVisualMetrics = require('../support/video/scripts/runVisualMetrics');
const removeVideo = require('../support/video/scripts/removeVideo');
const preURL = require('../support/preURL');
const extensionSetup = require('../support/extensionSetup');
const finetuneVideo = require('../support/video/scripts/finetuneVideo');
const connectivity = require('../support/connectivity');
const path = require('path');
const util = require('../support/util');
const filterWhitelisted = require('../support/userTiming').filterWhitelisted;
const moment = require('moment');
const get = require('lodash.get');
const xvfb = require('../support/video/xvfb');
const extensionServer = require('../support/extensionServer');
const forEach = require('lodash.foreach');

const defaults = {
  scripts: [],
  iterations: 3,
  delay: 0
};

function loadPrePostScripts(scripts) {
  return util.toArray(scripts).map(script => {
    try {
      return require(path.resolve(script));
    } catch (e) {
      throw new Error(
        "Couldn't run pre/post script file: " + path.resolve(script) + ' ' + e
      );
    }
  });
}

function jsonifyVisualProgress(visualProgress) {
  // Original data looks like
  //  "0=0%, 1500=81%, 1516=81%, 1533=84%, 1550=84%, 1566=84%, 1600=95%, 1683=95%, 1833=100%"
  const progress = visualProgress.split(',');
  const visualProgressJSON = {};
  forEach(progress, value => {
    const eachMetric = value.split('=');
    visualProgressJSON[eachMetric[0].replace(' ', '')] = Number(
      eachMetric[1].replace('%', '')
    );
  });
  return visualProgressJSON;
}

function addExtrasToHAR(harPage, visualMetricsData, timings, options) {
  const _meta = (harPage._meta = {});
  _meta.connectivity = get(options, 'connectivity.profile', 'native');
  const harPageTimings = harPage.pageTimings;

  const _visualMetrics = (harPage._visualMetrics = {});

  // We add the timings both as a hidden field and add
  // in pageTimings so we can easily show them in PerfCascade
  if (visualMetricsData) {
    harPageTimings._firstVisualChange = visualMetricsData.FirstVisualChange;
    harPageTimings._lastVisualChange = visualMetricsData.LastVisualChange;
    harPageTimings._visualComplete85 = visualMetricsData.VisualComplete85;
    harPageTimings._visualComplete95 = visualMetricsData.VisualComplete95;
    harPageTimings._visualComplete99 = visualMetricsData.VisualComplete99;
    _visualMetrics.FirstVisualChange = visualMetricsData.FirstVisualChange;
    _visualMetrics.SpeedIndex = visualMetricsData.SpeedIndex;
    _visualMetrics.VisualComplete85 = visualMetricsData.VisualComplete85;
    _visualMetrics.VisualComplete95 = visualMetricsData.VisualComplete95;
    _visualMetrics.VisualComplete99 = visualMetricsData.VisualComplete99;
    _visualMetrics.LastVisualChange = visualMetricsData.LastVisualChange;

    // Make the visual progress structure more JSON
    _visualMetrics.VisualProgress = jsonifyVisualProgress(
      visualMetricsData.VisualProgress
    );
  } else if (timings && timings.firstPaint) {
    // only add first paint if we don't have visual metrics
    harPageTimings._firstPaint = timings.firstPaint;
  }
  if (timings && timings.pageTimings) {
    harPageTimings._domInteractiveTime = timings.pageTimings.domInteractiveTime;
    harPageTimings._domContentLoadedTime =
      timings.pageTimings.domContentLoadedTime;
  }
}

function calculateViewport(options) {
  const emulatedWidth = get(options, 'chrome.mobileEmulation.width');
  const emulatedHeight = get(options, 'chrome.mobileEmulation.height');
  // you cannot set the width/height for phone so just keep the viewport undefined
  if (get(options, 'chrome.android.package')) {
    return;
  }

  if (emulatedWidth && emulatedHeight) {
    return `${emulatedWidth}x${emulatedHeight}`;
  }

  if (
    /^\d+x\d+$/.test(options.viewPort) ||
    (options.viewPort === 'maximize' && !options.xvfb)
  ) {
    return options.viewPort;
  }

  return '1200x960';
}

function timestamp() {
  return moment().format();
}

class Engine {
  constructor(options) {
    try {
      options.preScript = loadPrePostScripts(options.preScript);
      options.postScript = loadPrePostScripts(options.postScript);
    } catch (e) {
      log.error(e.message);
      throw e;
    }

    this.options = merge({}, defaults, options);
    this.options.viewPort = calculateViewport(this.options);
    this.runDelegate = engineDelegate.createDelegate(this.options);
  }

  startExtensionServer() {
    return extensionServer
      .startServer()
      .then(server => (this.extensionServer = server));
  }

  stopExtensionServer() {
    if (this.extensionServer) {
      return extensionServer.stopServer(this.extensionServer);
    } else return Promise.resolve();
  }

  startXvfb() {
    if (this.options.xvfb) {
      return xvfb
        .startXvfb({ size: this.options.viewPort, options: this.options })
        .tap(xvfbSession => {
          this.xvfbSession = xvfbSession;
        });
    } else return Promise.resolve();
  }

  stopXvfb() {
    if (this.xvfbSession) {
      return xvfb.stopXvfb(this.xvfbSession);
    } else return Promise.resolve();
  }

  start() {
    return Promise.all([
      this.startXvfb(),
      connectivity.set(this.options),
      this.startExtensionServer()
    ]);
  }

  run(url, scriptsByCategory, asyncScriptsByCategory) {
    const options = this.options;
    const isAndroid = get(options, 'chrome.android.package', false);
    const storageManager = new StorageManager(url, options);

    const taskData = {};

    if (
      options.cacheClearRaw ||
      options.requestheader ||
      options.block ||
      options.basicAuth
    ) {
      const port = this.extensionServer.address().port;
      options.preScript.push(extensionSetup(port, url));
    }

    if (options.preURL) {
      options.preScript.push(preURL);
    }

    if (options.speedIndex || options.video) {
      options.preScript.push(isAndroid ? startVideoAndroid : startVideo);

      const videoPostScripts = [isAndroid ? stopVideoAndroid : stopVideo];

      if (options.speedIndex) {
        videoPostScripts.push(runVisualMetrics);
      }

      if (options.video) {
        videoPostScripts.push(finetuneVideo);
      } else {
        videoPostScripts.push(removeVideo);
      }

      options.postScript.unshift(...videoPostScripts);

      if (isAndroid && options.chrome.collectNetLog) {
        options.postScript.push(pullNetLogAndroid);
      }
    }

    function runScript(runner, script, isAsync, name) {
      // Scripts should be valid statements or IIFEs '(function() {...})()' that can run
      // on their own in the browser console. Prepend with 'return' to return result of statement to Browsertime.
      return Promise.resolve(script).then(script => {
        if (isAsync) {
          const source = `
            var callback = arguments[arguments.length - 1];
            return (${script})
              .then((r) => callback({'result': r}))
              .catch((e) => callback({'error': e}));
            `;

          return runner.runAsyncScript(source, name).then(result => {
            if (result.error) {
              throw result.error;
            } else {
              return result.result;
            }
          });
        } else {
          const source = 'return ' + script;
          return runner.runScript(source, name);
        }
      });
    }

    function collectInfo(result, options) {
      merge(result.info, {
        browsertime: {
          version
        },
        url,
        timestamp: timestamp(),
        connectivity: {
          engine: get(options, 'connectivity.engine'),
          profile: get(options, 'connectivity.profile')
        }
      });
    }

    function runScriptInCategory(runner, category, isAsync) {
      return Promise.reduce(
        Object.keys(category),
        (results, scriptName) => {
          const script = category[scriptName];
          return runScript(runner, script, isAsync, scriptName).then(result => {
            if (!(result === null || result === undefined)) {
              results[scriptName] = result;
            }
            return results;
          });
        },
        {}
      );
    }

    function runScripts(runner, scriptsByCategory, isAsync) {
      if (!scriptsByCategory) {
        return Promise.resolve({});
      }
      return Promise.resolve(scriptsByCategory).then(scripts => {
        const categoryNames = Object.keys(scripts);
        return Promise.reduce(
          categoryNames,
          (results, categoryName) => {
            const category = scripts[categoryName];

            return runScriptInCategory(
              runner,
              category,
              isAsync
            ).then(result => {
              results[categoryName] = result;
              return results;
            });
          },
          {}
        );
      });
    }

    function runIteration(index) {
      options.index = index;
      const runner = new SeleniumRunner(options);

      log.info('Testing url %s run %s', url, index + 1);
      return Promise.resolve({
        browserScripts: [],
        extraJson: {}
      })
        .tap(() => runner.start())
        .tap(() =>
          Promise.mapSeries(options.preScript, preScript =>
            preScript.run({
              url,
              options,
              log,
              storageManager,
              taskData,
              index,
              webdriver,
              runWithDriver: function(driverScript) {
                return runner.runWithDriver(driverScript);
              }
            })
          )
        )
        .tap(() => runDelegate.onStartIteration(runner, index))
        .tap(result => {
          result.timestamp = timestamp();
        })
        .tap(() => runner.loadAndWait(url, options.pageCompleteCheck))
        .tap(result => {
          const syncScripts = runScripts(runner, scriptsByCategory),
            asyncScripts = runScripts(runner, asyncScriptsByCategory, true);

          return Promise.join(
            syncScripts,
            asyncScripts,
            (syncScripts, asyncScripts) => merge({}, syncScripts, asyncScripts)
          ).then(browserScripts => {
            result.browserScripts = browserScripts;
          });
        })
        .tap(result => {
          if (options.userTimingWhitelist) {
            filterWhitelisted(
              result.browserScripts.timings.userTimings,
              options.userTimingWhitelist
            );
          }
        })
        .tap(results => {
          if (options.screenshot) {
            return runner
              .takeScreenshot()
              .tap(pngData => (results.screenshot = pngData));
          }
        })
        .tap(results => runDelegate.onStopIteration(runner, index, results))
        .tap(results =>
          Promise.mapSeries(options.postScript, postScript =>
            postScript.run({
              url,
              options,
              log,
              results,
              storageManager,
              taskData,
              index,
              webdriver,
              runWithDriver: function(driverScript) {
                return runner.runWithDriver(driverScript);
              }
            })
          )
        )
        .finally(() => runner.stop());
    }

    function shouldDelay(runIndex, totalRuns) {
      const moreRunsWillFollow = totalRuns - runIndex > 1;
      return options.delay > 0 && moreRunsWillFollow;
    }

    const iterations = new Array(this.options.iterations),
      runDelegate = this.runDelegate;

    return Promise.resolve({
      timestamps: [],
      browserScripts: [],
      screenshots: [],
      extraJson: {},
      info: {},
      visualMetrics: []
    })
      .tap(result => collectInfo(result, options))
      .tap(() =>
        storageManager
          .createDataDir()
          .tap(baseDir => (options.baseDir = baseDir))
      )
      .tap(() => runDelegate.onStartRun(url, options))
      .tap(result =>
        Promise.reduce(
          iterations,
          (results, item, runIndex, totalRuns) => {
            let promise = runIteration(runIndex).then(iterationData => {
              results.timestamps.push(iterationData.timestamp);
              results.browserScripts.push(iterationData.browserScripts);
              if (iterationData.screenshot) {
                results.screenshots.push(iterationData.screenshot);
              }
              if (iterationData.visualMetrics) {
                results.visualMetrics.push(iterationData.visualMetrics);
              }
              results.extraJson = merge(
                results.extraJson,
                iterationData.extraJson
              );
              return results;
            });

            if (shouldDelay(runIndex, totalRuns)) {
              promise = promise.delay(options.delay);
            }

            return promise;
          },
          result
        )
      )
      .tap(result => this.runDelegate.onStopRun(result))
      .tap(result => {
        const statistics = new Statistics();
        result.browserScripts.forEach(data =>
          statistics.addDeep(data, (keyPath, value) => {
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
          })
        );
        result.visualMetrics.forEach(data =>
          statistics.addDeep({ visualMetrics: data })
        );
        result.statistics = statistics.summarizeDeep(options);
      })
      .tap(result => {
        // Add extra fields to the HAR
        if (result.har) {
          for (let run = 0; run < result.har.log.pages.length; run++) {
            addExtrasToHAR(
              result.har.log.pages[run],
              result.visualMetrics[run],
              result.browserScripts[run].timings,
              options
            );
          }
        }
      })
      .tap(result => {
        log.info(util.getResultLogLine(result));
        return result;
      })
      .catch(Promise.TimeoutError, e => {
        throw new UrlLoadError(
          'Failed to load ' + url + ', cause: ' + e.message,
          url,
          {
            cause: e
          }
        );
      });
  }

  stop() {
    return Promise.all([
      this.stopXvfb(),
      connectivity.remove(this.options),
      this.stopExtensionServer()
    ]);
  }
}

module.exports = Engine;
