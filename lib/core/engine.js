'use strict';

let Promise = require('bluebird'),
  log = require('intel'),
  path = require('path'),
  merge = require('lodash.merge'),
  toArray = require('../support/toArray'),
  engineDelegate = require('./engineDelegate'),
  SeleniumRunner = require('./selenium_runner');

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

  run(url) {
    let options = this.options;
    let preTasks = toArray(options.preTask),
      postTasks = toArray(options.postTask);

    let scripts = Promise.resolve(options.scripts)
      .then((scripts) => toArray(scripts));

    let pageCompleteCheck = options.pageCompleteCheck;
    let delay = options.delay;

    let taskData = {};

    function runScripts(runner) {
      return Promise.reduce(scripts, function(results, script) {
        let name = path.basename(script.path, '.js');
        // Scripts should be valid statements such as 'document.title;') or IIFEs '(function() {...})()' that can run
        // on their own in the browser console. Prepend with 'return' to return result of statement to Browsertime.
        let source = 'return ' + script.source;
        let result = runner.runScript(source);

        return Promise.join(name, result, function(n, r) {
          results[n] = r;
          return results;
        });
      }, {});
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
        .then(() => runScripts(runner))
        .tap(() => runDelegate.onStopIteration(runner, index))
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

    return Promise.resolve({})
      .tap(() => runDelegate.onStartRun(url, options))
      .then((result) =>
        Promise.reduce(iterations, (browsertimeData, item, runIndex, totalRuns) => {
            let promise = runIteration(runIndex)
              .then((iterationData) => {
                browsertimeData.push(iterationData);
                return browsertimeData;
              });

            if (shouldDelay(runIndex, totalRuns)) {
              promise = promise.delay(delay);
            }

            return promise;
          }, [])
          .then((browsertimeData) => {
            result.browsertimeData = browsertimeData;
            return result;
          })
      )
      .tap((result) => this.runDelegate.onStopRun(result));
  }

  stop() {
    return this.runDelegate.onStop();
  }
}

module.exports = Engine;
