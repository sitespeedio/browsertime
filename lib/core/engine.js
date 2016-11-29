'use strict';

const Promise = require('bluebird'),
  log = require('intel'),
  merge = require('lodash.merge'),
  version = require('../../package').version,
  Statistics = require('../support/statistics').Statistics,
  StorageManager = require('../support/storageManager'),
  engineDelegate = require('./engineDelegate'),
  SeleniumRunner = require('./seleniumRunner'),
  webdriver = require('selenium-webdriver'),
  UrlLoadError = require('../support/errors').UrlLoadError,
  startVideo = require('../support/video/scripts/startVideo'),
  stopVideo = require('../support/video/scripts/stopVideo'),
  runVisualMetrics = require('../support/video/scripts/runVisualMetrics'),
  removeVideo = require('../support/video/scripts/removeVideo'),
  connectivity = require('../support/connectivity'),
  path = require('path'),
  util = require('../support/util'),
  moment = require('moment'),
  get = require('lodash.get'),
  xvfb = require('../support/video/xvfb');

const defaults = {
  scripts: [],
  iterations: 3,
  delay: 0,
  experimental: {}
};

function toArray(arrayLike) {
  if (arrayLike == null) {
    return [];
  }
  if (Array.isArray(arrayLike)) {
    return arrayLike;
  }
  return [arrayLike];
}

function loadPrePostScripts(scripts) {
  return toArray(scripts).map((script) => {
    try {
      return require(path.resolve(script));
    } catch (e) {
      throw new Error('Couldn\'t run pre/post script file: ' + path.resolve(script) + ' ' + e);
    }
  });
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

  if (/^\d+x\d+$/.test(options.viewPort)) {
    return options.viewPort;
  }

  return '1200x960';
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

  startXvfb() {
    if (this.options.xvfb) {
      return xvfb.startXvfb({size: this.options.viewPort})
        .tap((xvfbSession) => {
          this.xvfbSession = xvfbSession;
        });
    }
    else return Promise.resolve();
  }

  stopXvfb() {
    if (this.xvfbSession) {
      return xvfb.stopXvfb(this.xvfbSession);
    }
    else return Promise.resolve();
  }

  start() {
    return Promise.all([this.startXvfb(), connectivity.set(this.options)]);
  }

  run(url, scriptsByCategory, asyncScriptsByCategory) {
    const options = this.options;
    const storageManager = new StorageManager(url, options);

    const taskData = {};

    if (options.speedindex || options.video) {
      options.preScript.push(startVideo);

      const videoPostScripts = [stopVideo];

      if (options.speedindex) {
        videoPostScripts.push(runVisualMetrics);
      }
      if (!options.video) {
        videoPostScripts.push(removeVideo);
      }

      options.postScript.unshift(...videoPostScripts);
    }

    function runScript(runner, script, isAsync, name) {
      // Scripts should be valid statements or IIFEs '(function() {...})()' that can run
      // on their own in the browser console. Prepend with 'return' to return result of statement to Browsertime.
      return Promise.resolve(script)
        .then((script) => {
          if (isAsync) {
            const source = `
            var callback = arguments[arguments.length - 1];
            return (${script})
              .then((r) => callback({'result': r}))
              .catch((e) => callback({'error': e}));
            `;

            return runner.runAsyncScript(source, name)
              .then((result) => {
                if (result.error) {
                  throw result.error;
                } else {
                  return result.result;
                }
              })
          } else {
            const source = 'return ' + script;
            return runner.runScript(source, name)
          }
        });
    }

    function collectInfo(result) {
      merge(result.info, {
        browsertime: {
          version
        },
        url,
        timestamp: moment().format()
      });
    }

    function runScriptInCategory(runner, category, isAsync) {
      return Promise.reduce(Object.keys(category), (results, scriptName) => {
        const script = category[scriptName];
        return runScript(runner, script, isAsync, scriptName)
          .then((result) => {
            if (!(result === null || result === undefined)) {
              results[scriptName] = result;
            }
            return results;
          });
      }, {});
    }

    function runScripts(runner, scriptsByCategory, isAsync) {
      if (!scriptsByCategory) {
        return Promise.resolve({});
      }
      return Promise.resolve(scriptsByCategory)
        .then((scripts) => {
          const categoryNames = Object.keys(scripts);
          return Promise.reduce(categoryNames, (results, categoryName) => {
            const category = scripts[categoryName];

            return runScriptInCategory(runner, category, isAsync)
              .then((result) => {
                results[categoryName] = result;
                return results;
              });
          }, {});
        });
    }

    function runIteration(index) {
      const runner = new SeleniumRunner(options);

      log.info('Testing url %s run %s', url, index + 1);
      return runner.start()
        .tap(() => Promise.mapSeries(options.preScript, (preScript) => preScript.run(
          {
            url,
            options,
            log,
            storageManager,
            taskData,
            index,
            webdriver,
            'runWithDriver': function(driverScript) {
              return runner.runWithDriver(driverScript);
            }
          })
        ))
        .tap(() => runDelegate.onStartIteration(runner, index))
        .tap(() => runner.loadAndWait(url, options.pageCompleteCheck))
        .then(() => {
          const syncScripts = runScripts(runner, scriptsByCategory),
            asyncScripts = runScripts(runner, asyncScriptsByCategory, true);

          return Promise.join(syncScripts, asyncScripts, (syncScripts, asyncScripts) =>
            merge({}, syncScripts, asyncScripts));
        })
        .then((result) => {
          return {
            browserScripts: result,
            extraJson: {}
          }
        })
        .tap((results) => {
          if (options.screenshot) {
            return runner.takeScreenshot()
              .tap((pngData) =>
                results.screenshot = pngData);
          }
        })
        .tap((results) => runDelegate.onStopIteration(runner, index, results))
        .tap((results) => Promise.mapSeries(options.postScript, (postScript) => postScript.run(
          {
            url,
            options,
            log,
            results,
            storageManager,
            taskData,
            index,
            webdriver,
            'runWithDriver': function(driverScript) {
              return runner.runWithDriver(driverScript);
            }
          })
        ))
        .finally(() => runner.stop());
    }

    function shouldDelay(runIndex, totalRuns) {
      const moreRunsWillFollow = ((totalRuns - runIndex) > 1);
      return (options.delay > 0) && moreRunsWillFollow;
    }

    const iterations = new Array(this.options.iterations),
      runDelegate = this.runDelegate;

    return Promise.resolve({
      browserScripts: [],
      screenshots: [],
      extraJson: {},
      info: {},
      visualMetrics: []
    })
      .tap((result) => collectInfo(result))
      .tap(() => runDelegate.onStartRun(url, options))
      .tap((result) =>
        Promise.reduce(iterations, (results, item, runIndex, totalRuns) => {
          let promise = runIteration(runIndex)
            .then((iterationData) => {
              results.browserScripts.push(iterationData.browserScripts);
              if (iterationData.screenshot) {
                results.screenshots.push(iterationData.screenshot);
              }
              if (iterationData.visualMetrics) {
                results.visualMetrics.push(iterationData.visualMetrics);
              }
              results.extraJson = merge(results.extraJson, iterationData.extraJson);
              return results;
            });

          if (shouldDelay(runIndex, totalRuns)) {
            promise = promise.delay(options.delay);
          }

          return promise;
        }, result)
      )
      .tap((result) => this.runDelegate.onStopRun(result))
      .tap((result) => {
        const statistics = new Statistics();
        result.browserScripts.forEach((data) =>
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
          }));
        result.visualMetrics.forEach((data) =>
          statistics.addDeep({visualMetrics: data}));
        result.statistics = statistics.summarizeDeep(options);

      }).tap((result) => {
        log.info(util.getResultLogLine(result));
        return result;
      })
      .catch(Promise.TimeoutError, (e) => {
        throw new UrlLoadError('Failed to load ' + url + ', cause: ' + e.message, url, {
          cause: e
        });
      });
  }

  stop() {
    return Promise.all([this.stopXvfb(), connectivity.remove(this.options)]);
  }
}

module.exports = Engine;
