'use strict';

let Promise = require('bluebird'),
  log = require('intel'),
  merge = require('lodash.merge'),
  version = require('../../package').version,
  toArray = require('../support/util').toArray,
  Statistics = require('../support/statistics').Statistics,
  engineDelegate = require('./engineDelegate'),
  SeleniumRunner = require('./seleniumRunner'),
  startVideo = require('../support/startVideo'),
  stopVideo = require('../support/stopVideo'),
  moment = require('moment');

const defaults = {
  scripts: [],
  iterations: 3,
  delay: 0,
  experimental: {}
};

class Engine {
  constructor(options) {
    this.options = merge({}, defaults, options);
    this.runDelegate = engineDelegate.createDelegate(this.options);
  }

  start() {
    return this.runDelegate.onStart();
  }

  run(url, scriptsByCategory, asyncScriptsByCategory) {
    let options = this.options;
    let preTasks = toArray(options.preTask),
      postTasks = toArray(options.postTask);

    let pageCompleteCheck = options.pageCompleteCheck;
    let delay = options.delay;

    let taskData = {};
    if (options.exprimental && options.exprimental.video) {
      preTasks.push(startVideo);
      postTasks.unshift(stopVideo);
    }

    function runScript(runner, script, isAsync) {
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

            return runner.runAsyncScript(source)
              .then((result) => {
                if (result.error) {
                  throw result.error;
                } else {
                  return result.result;
                }
              })
          } else {
            const source = 'return ' + script;
            return runner.runScript(source)
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
        return runScript(runner, script, isAsync)
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
      let runner = new SeleniumRunner(options);

      return runner.start()
        .tap(() => Promise.map(preTasks, (preTask) => preTask.run(
          {
            url,
            options,
            log,
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
        .tap((results) => Promise.map(postTasks, (postTask) => postTask.run(
          {
            url,
            options,
            log,
            results,
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
      let moreRunsWillFollow = ((totalRuns - runIndex) > 1);
      return (delay > 0) && moreRunsWillFollow;
    }

    let iterations = new Array(this.options.iterations),
      runDelegate = this.runDelegate;

    return Promise.resolve({
      browserScripts: [],
      screenshots: [],
      extras: {},
      info: {},
      visualMetrics: [{"firstVisualChange":434,"lastVisualChange":2834,"speedIndex":460,"visualProgress":"0=0%, 434=92%, 467=97%, 1000=97%, 1200=100%, 1234=100%, 1267=100%, 1300=99%, 1334=99%, 1367=100%, 1434=99%, 1467=99%, 1500=99%, 1534=99%, 1567=99%, 1600=100%, 1634=100%, 1667=100%, 1700=100%, 1767=100%, 2000=100%, 2034=100%, 2067=100%, 2100=100%, 2167=100%, 2400=100%, 2434=100%, 2467=100%, 2500=100%, 2567=100%, 2800=100%, 2834=100%"},{"firstVisualChange":300,"lastVisualChange":2834,"speedIndex":326,"visualProgress":"0=0%, 300=92%, 334=96%, 367=96%, 467=97%, 800=100%, 834=100%, 867=100%, 900=100%, 967=100%, 1000=100%, 1034=100%, 1067=100%, 1100=100%, 1134=99%, 1167=99%, 1200=100%, 1234=100%, 1267=100%, 1300=100%, 1367=100%, 1600=100%, 1634=99%, 1667=100%, 1700=100%, 1767=99%, 2000=100%, 2034=99%, 2067=100%, 2100=100%, 2167=99%, 2400=100%, 2434=99%, 2467=100%, 2500=100%, 2567=99%, 2800=100%, 2834=100%"},{"firstVisualChange":334,"lastVisualChange":2834,"speedIndex":355,"visualProgress":"0=0%, 334=96%, 367=96%, 467=97%, 700=97%, 800=100%, 834=100%, 867=100%, 900=99%, 967=99%, 1067=99%, 1100=99%, 1134=99%, 1200=100%, 1234=99%, 1267=99%, 1300=99%, 1367=99%, 1600=100%, 1634=100%, 1667=100%, 1700=100%, 1767=100%, 2000=100%, 2034=100%, 2067=100%, 2100=100%, 2167=100%, 2400=100%, 2434=100%, 2467=100%, 2500=100%, 2567=100%, 2800=100%, 2834=100%"}]
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
            if (result.visualMetrics) {
              result.visualMetrics.forEach((data) =>

                statistics.addDeep(data, (keyPath, value) => {
                  console.log(data);
                  return value;
              }));
            }
          result.statistics = statistics.summarizeDeep(options);
        }
      });
  }

  stop() {
    return this.runDelegate.onStop();
  }
}

module.exports = Engine;
