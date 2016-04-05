'use strict';

let Promise = require('bluebird'),
  log = require('intel'),
  merge = require('lodash.merge'),
  toArray = require('../support/toArray'),
  engineDelegate = require('./engineDelegate'),
  SeleniumRunner = require('./seleniumRunner');

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

    return Promise.resolve()
      .tap(() => runDelegate.onStartRun(url, options))
      .then(() =>
        Promise.reduce(iterations, (browsertimeData, item, runIndex, totalRuns) => {
            let promise = runIteration(runIndex)
              .then((iterationData) => {
                browsertimeData.browserScripts.push(iterationData.browserScripts);
                if (iterationData.screenshot) {
                  browsertimeData.screenshots.push(iterationData.screenshot);
                }
                browsertimeData.extras = merge(browsertimeData.extras, iterationData.extras);
                return browsertimeData;
              });

            if (shouldDelay(runIndex, totalRuns)) {
              promise = promise.delay(delay);
            }

            return promise;
          }, {
            browserScripts: [],
            screenshots: [],
            extras: {}
          })
      )
      .tap((result) => this.runDelegate.onStopRun(result));
  }

  stop() {
    return this.runDelegate.onStop();
  }
}

module.exports = Engine;
