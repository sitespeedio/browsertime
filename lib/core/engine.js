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
const { BrowserError, UrlLoadError } = require('../support/errors');
const startVideoDesktop = require('../support/video/scripts/startVideo');
const startVideoAndroid = require('../support/video/scripts/startVideoAndroid');
const pullNetLogAndroid = require('../support/pullNetLogAndroid');
const stopVideoDesktop = require('../support/video/scripts/stopVideo');
const stopVideoAndroid = require('../support/video/scripts/stopVideoAndroid');
const runVisualMetrics = require('../support/video/scripts/runVisualMetrics');
const removeVideo = require('../support/video/scripts/removeVideo');
const preURL = require('../support/preURL');
const extensionSetup = require('../support/extensionSetup');
const finetuneVideo = require('../support/video/scripts/finetuneVideo');
const connectivity = require('../support/connectivity');
const util = require('../support/util');
const filterWhitelisted = require('../support/userTiming').filterWhitelisted;
const get = require('lodash.get');
const xvfb = require('../support/video/xvfb');
const extensionServer = require('../support/extensionServer');
const engineUtils = require('../support/engineUtils');
const chromeCPU = require('../support/chromeCPU');
const forEach = require('lodash.foreach');

const defaults = {
  scripts: [],
  iterations: 3,
  delay: 0,
  videoParams: {}
};

class Engine {
  constructor(options) {
    try {
      this.preScripts = engineUtils.loadPrePostScripts(options.preScript);
      this.postScripts = engineUtils.loadPrePostScripts(options.postScript);
    } catch (e) {
      log.error(e.message);
      throw e;
    }

    this.options = merge({}, defaults, options);
    this.options.viewPort = engineUtils.calculateViewport(this.options);
    this.runDelegate = engineDelegate.createDelegate(this.options);
    this.collectChromeTimeline =
      options.chrome &&
      options.chrome.collectTracingEvents &&
      options.chrome.collectCPUMetrics;
    this.isAndroid = get(options, 'chrome.android.package', false);
    this.recordVideo = options.speedIndex || options.video;
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
    // This is the fix for the current use of ENV in Docker
    // we should do a better fix for that
    const useXvfb = get(this.options, 'xvfb', false);
    if (useXvfb === true || useXvfb === 'true') {
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
    const recordVideo = this.recordVideo;
    const extensionServer = this.extensionServer;
    const isAndroid = get(options, 'chrome.android.package', false);
    const storageManager = new StorageManager(url, options);
    const collectChromeTimeline = this.collectChromeTimeline;
    const taskData = {};

    if (isAndroid && options.chrome.collectNetLog) {
      this.postScripts.push(pullNetLogAndroid);
    }

    function startVideo(conf) {
      return isAndroid
        ? startVideoAndroid.run(conf)
        : startVideoDesktop.run(conf);
    }

    function stopVideo(conf) {
      return isAndroid
        ? stopVideoAndroid.run(conf)
        : stopVideoDesktop.run(conf);
    }
    function postProcessVideo() {
      const postProcess = [];
      if (options.speedIndex) {
        postProcess.push(runVisualMetrics);
      }

      if (options.video) {
        postProcess.push(finetuneVideo);
      } else {
        postProcess.push(removeVideo);
      }
      return postProcess;
    }

    function setupExtension(url) {
      // always start with running our extension for the setup
      if (
        options.cacheClearRaw ||
        options.requestheader ||
        options.block ||
        options.basicAuth
      ) {
        const port = extensionServer.address().port;
        return extensionSetup(port, url);
      } else return Promise.resolve();
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
        timestamp: engineUtils.timestamp(),
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

            return runScriptInCategory(runner, category, isAsync).then(
              result => {
                results[categoryName] = result;
                return results;
              }
            );
          },
          {}
        );
      });
    }

    function runIteration(index, preScripts, postScripts) {
      options.index = index;
      const runner = new SeleniumRunner(options);
      const taskOptions = {
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
      };
      log.info('Testing url %s run %s', url, index + 1);
      return Promise.resolve({
        browserScripts: [],
        extraJson: {}
      })
        .tap(() => runner.start())
        .tap(() => setupExtension(url))
        .tap(() => {
          if (options.videoParams.combine && recordVideo) {
            return startVideo(taskOptions);
          } else return Promise.resolve();
        })
        .tap(() =>
          Promise.mapSeries(preScripts, preScript => preScript.run(taskOptions))
        )
        .tap(() => {
          if (options.preURL) {
            return preURL.run(taskOptions);
          } else return Promise.resolve();
        })
        .tap(() => runDelegate.onStartIteration(runner, index))
        .tap(result => {
          result.timestamp = engineUtils.timestamp();
        })
        .tap(() => {
          if (!options.videoParams.combine && recordVideo) {
            return startVideo(taskOptions);
          } else return Promise.resolve();
        })
        .tap(() => runner.loadAndWait(url, options.pageCompleteCheck))
        .tap(() => {
          if (!options.videoParams.combine && recordVideo) {
            return stopVideo(taskOptions);
          } else return Promise.resolve();
        })
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
          if (options.chrome && options.chrome.collectConsoleLog) {
            return runner
              .getLogs(webdriver.logging.Type.BROWSER)
              .tap(
                browserLog =>
                  (results.extraJson[`console-${index}.json`] = browserLog)
              );
          }
        })
        .tap(results => {
          if (options.screenshot) {
            return runner
              .takeScreenshot()
              .tap(pngData => (results.screenshot = pngData))
              .catch(BrowserError, e => {
                // not getting screenshots shouldn't result in a failed test.
                log.warning(e);
              });
          } else return Promise.resolve();
        })
        .tap(results => runDelegate.onStopIteration(runner, index, results))
        .tap(results =>
          Promise.mapSeries(postScripts, postScript => {
            taskOptions.results = results;
            return postScript.run(taskOptions);
          })
        )
        .tap(() => {
          if (options.videoParams.combine && recordVideo) {
            return stopVideo(taskOptions);
          } else return Promise.resolve();
        })
        .finally(() => runner.stop())
        .tap(results => {
          if (recordVideo) {
            taskOptions.results = results;
            return Promise.mapSeries(postProcessVideo(), steps =>
              steps.run(taskOptions)
            );
          } else return Promise.resolve();
        });
    }

    function shouldDelay(runIndex, totalRuns) {
      const moreRunsWillFollow = totalRuns - runIndex > 1;
      return options.delay > 0 && moreRunsWillFollow;
    }

    const iterations = new Array(this.options.iterations),
      runDelegate = this.runDelegate;
    const statistics = new Statistics();

    return Promise.resolve({
      timestamps: [],
      browserScripts: [],
      info: {},
      visualMetrics: [],
      cpu: []
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
            let promise = runIteration(
              runIndex,
              this.preScripts,
              this.postScripts
            ).then(iterationData => {
              // From each run, collect the result we want
              results.timestamps.push(iterationData.timestamp);
              results.browserScripts.push(iterationData.browserScripts);
              // Add all browserscripts to the stats
              statistics.addDeep(
                iterationData.browserScripts,
                (keyPath, value) => {
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
                }
              );

              if (iterationData.visualMetrics) {
                results.visualMetrics.push(iterationData.visualMetrics);
                statistics.addDeep({
                  visualMetrics: iterationData.visualMetrics
                });
              }
              const extraWork = [];
              if (options.screenshot) {
                extraWork.push(
                  storageManager.writeData(
                    `screenshot-${runIndex}.png`,
                    iterationData.screenshot
                  )
                );
              }

              // Collect CPU data. There are some extra work going on here now
              // in the future we could use the already stored trace log
              // but let us change that later on
              if (collectChromeTimeline) {
                extraWork.push(
                  chromeCPU
                    .get(
                      iterationData.extraJson[`trace-${runIndex}.json`],
                      storageManager.baseDir,
                      runIndex
                    )
                    .then(timelinesArray => {
                      result.cpu.push(timelinesArray);
                      statistics.addDeep({ cpu: timelinesArray });
                      return Promise.resolve();
                    })
                );
              }

              // Store all extra JSON metrics
              forEach(iterationData.extraJson, (value, key) =>
                extraWork.push(storageManager.writeJson(key, value))
              );

              return Promise.all(extraWork).then(() => {
                return results;
              });
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
        // add the options metrics we want
        result.statistics = statistics.summarizeDeep(options);
      })
      .tap(result => {
        // Add extra fields to the HAR
        if (result.har) {
          const numPages = result.har.log.pages.length;
          if (numPages !== this.options.iterations) {
            log.error(
              `Number of HAR pages (${
                numPages
              }) does not match number of iterations (${
                this.options.iterations
              })`
            );
            return;
          }

          for (let run = 0; run < numPages; run++) {
            const page = result.har.log.pages[run];
            const visualMetric = result.visualMetrics[run];
            const browserScript = result.browserScripts[run] || {};
            const cpu = result.cpu[run] || {};
            engineUtils.addExtrasToHAR(
              page,
              visualMetric,
              browserScript.timings,
              cpu,
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
