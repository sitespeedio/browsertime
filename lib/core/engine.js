'use strict';

let Promise = require('bluebird'),
  path = require('path'),
  merge = require('lodash.merge'),
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
    let scripts = options.scripts;
    let pageCompleteCheck = options.pageCompleteCheck;
    let delay = options.delay;

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
        .tap(() => runDelegate.onStartIteration(runner, index))
        .tap(() => runner.loadAndWait(url, pageCompleteCheck))
        .then(() => runScripts(runner))
        .tap(() => runDelegate.onStopIteration(runner, index))
        .finally(() => runner.stop());
    }

    function shouldDelay(runIndex, totalRuns) {
      let moreRunsWillFollow = ((totalRuns - runIndex) > 1);
      return (delay > 0) && moreRunsWillFollow;
    }

    let iterations = new Array(this.options.iterations),
      runDelegate = this.runDelegate;

    let result = {};
    return runDelegate.onStartRun(url, options)
      .then(() => Promise.reduce(iterations, (results, item, runIndex, totalRuns) => {
          let promise = runIteration(runIndex)
            .then((r) => {
              results.push(r);
              return results;
            });

          if (shouldDelay(runIndex, totalRuns)) {
            promise = promise.delay(delay);
          }

          return promise;
        }, [])
      )
      .tap((data) => {
        result.browsertimeData = data;
      })
      .then(() => this.runDelegate.onStopRun(result))
      .then(() => result);
  }

  stop() {
    return this.runDelegate.onStop();
  }
}

module.exports = Engine;
