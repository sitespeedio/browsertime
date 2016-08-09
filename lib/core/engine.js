'use strict';

const Promise = require('bluebird'),
  log = require('intel'),
  merge = require('lodash.merge'),
  version = require('../../package').version,
  toArray = require('../support/util').toArray,
  Statistics = require('../support/statistics').Statistics,
  StorageManager = require('../support/storageManager'),
  engineDelegate = require('./engineDelegate'),
  SeleniumRunner = require('./seleniumRunner'),
  UrlLoadError = require('../support/errors').UrlLoadError,
  startVideo = require('../support/startVideo'),
  stopVideo = require('../support/stopVideo'),
  util = require('../support/util'),
  connectivity = require('../support/connectivity'),
  path = require('path'),
  moment = require('moment');

const defaults = {
  scripts: [],
  iterations: 3,
  delay: 0,
  experimental: {}
};

function loadPrePostScripts(scripts) {
  return util.toArray(scripts).map((script) => {
    try {
      return require(path.resolve(script));
    } catch (e) {
      throw new Error('Couldn\'t run pre/post script file: ' + path.resolve(script) + ' ' + e);
    }
  });
}

class Engine {
  constructor(options) {
    try {
      if (options.preScript) {
        options.preScript = loadPrePostScripts(options.preScript);
      }
      if (options.postScript) {
        options.postScript = loadPrePostScripts(options.postScript);
      }
    } catch (e) {
      log.error(e.message);
      throw e;
    }

    this.options = merge({}, defaults, options);
    this.runDelegate = engineDelegate.createDelegate(this.options);
  }

  start() {
    const runDelegate = this.runDelegate;
      if (this.options.connectivity && this.options.connectivity.profile !== 'native' && this.options.connectivity.profile !== undefined) {
    return connectivity.set(this.options).then(function() {
      return runDelegate.onStart();
    }).catch(function(e) {
      log.error('Error running browsertime', e);
      throw e;
    });
  } else return runDelegate.onStart();
  }

  run(url, scriptsByCategory, asyncScriptsByCategory) {
    const options = this.options,
      preScripts = toArray(options.preScript),
      postScripts = toArray(options.postScript),
      pageCompleteCheck = options.pageCompleteCheck,
      delay = options.delay;

    const storageManager = new StorageManager(url, options);

    const taskData = {};

    if (options.experimental && options.experimental.video) {
      preScripts.push(startVideo);
      postScripts.unshift(stopVideo);
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

      log.info('Testing url %s run %s', url, index+1);
      return runner.start()
        .tap(() => Promise.map(preScripts, (preScript) => preScript.run(
          {
            url,
            options,
            log,
            storageManager,
            taskData,
            index,
            'runWithDriver': function(driverScript) {
              return runner.runWithDriver(driverScript);
            }
          })
        ))
        .tap(() => runDelegate.onStartIteration(runner, index))
        .tap(() => runner.loadAndWait(url, pageCompleteCheck))
        .then(() => {
          const syncScripts = runScripts(runner, scriptsByCategory),
            asyncScripts = runScripts(runner, asyncScriptsByCategory, true);

          return Promise.join(syncScripts, asyncScripts, (syncScripts, asyncScripts) =>
            merge({}, syncScripts, asyncScripts));
        })
        .then((result) => {
          return {
            browserScripts: result,
            extras: {}
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
        .tap((results) => Promise.map(postScripts, (postScript) => postScript.run(
          {
            url,
            options,
            log,
            results,
            storageManager,
            taskData,
            index,
            'runWithDriver': function(driverScript) {
              return runner.runWithDriver(driverScript);
            }
          })
        ))
        .finally(() => runner.stop());
    }

    function shouldDelay(runIndex, totalRuns) {
      const moreRunsWillFollow = ((totalRuns - runIndex) > 1);
      return (delay > 0) && moreRunsWillFollow;
    }

    const iterations = new Array(this.options.iterations),
      runDelegate = this.runDelegate;

    return Promise.resolve({
      browserScripts: [],
      screenshots: [],
      extras: {},
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
              results.extras = merge(results.extras, iterationData.extras);
              return results;
            });

          if (shouldDelay(runIndex, totalRuns)) {
            promise = promise.delay(delay);
          }

          return promise;
        }, result)
      )
      .tap((result) => this.runDelegate.onStopRun(result))
      .tap((result) => {
        if (options.statistics) {
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
        }
      })
      .catch(Promise.TimeoutError, (e) => {
        throw new UrlLoadError('Failed to load ' + url + ', cause: ' + e.message, url, {
          cause: e
        });
      });
  }

  stop() {
    const runDelegate = this.runDelegate;
    if (this.options.connectivity && this.options.connectivity.profile !== 'native' && this.options.connectivity.profile !== undefined) {
      return connectivity.remove(this.options).then(function() {
        return runDelegate.onStop()
      });

    }
      else return runDelegate.onStop();
  }
}

module.exports = Engine;
