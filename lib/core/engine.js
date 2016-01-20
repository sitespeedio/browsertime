'use strict';

let Promise = require('bluebird'),
  path = require('path'),
  merge = require('lodash.merge'),
  harBuilder = require('../support/har_builder'),
  engineDelegate = require('./engineDelegate'),
  SeleniumRunner = require('./selenium_runner');

const defaults = {
  'scripts': [],
  'iterations': 3,
  'delay': 0
};

class Engine {
  constructor(options) {
    this.options = merge({}, defaults, options);
    this.runDelegate = engineDelegate.createDelegate(options);
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

    function runIteration() {
      let runner = new SeleniumRunner(options);

      return runner.start()
        .tap(() => runner.loadAndWait(url, pageCompleteCheck))
        .then(() => runScripts(runner))
        .tap((result) => {
          if (options.browser === 'firefox') {
            const script = `
            var callback = arguments[arguments.length - 1];
            function triggerExport() {
              HAR.triggerExport({'token':'test', 'getData':true})
                .then((result) => {
                  // Fix timings via performance.timing, see https://github.com/firebug/har-export-trigger/issues/5
                  var har = JSON.parse(result.data);
                  var t = performance.timing;
                  var pageTimings = har.log.pages[0].pageTimings;
                  pageTimings.onContentLoad = t.domContentLoadedEventStart - t.navigationStart;
                  pageTimings.onLoad = t.loadEventStart - t.navigationStart;

                  return callback(JSON.stringify(har));
              })
              .catch((e) => callback(e));
            };
            if (typeof HAR === 'undefined') {
              addEventListener('har-api-ready', triggerExport, false);
            } else {
              triggerExport();
            }`;
            return runner.runAsyncScript(script).then(JSON.parse).then((har) => {
              // TODO potentially remove incomplete entries, such as with response.status=0 or time=null
              result.ffHar = har;
            });
          }
        })
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
      .then(() => Promise.reduce(iterations, function(results, item, runIndex, totalRuns) {
          let promise = runDelegate.onStartIteration()
            .then(runIteration)
            .then(function(r) {
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
        if (options.browser === 'firefox') {
          let ffHars = [];
          data = data.map((iterationData) => {
            let ffHar = iterationData.ffHar;
            delete iterationData.ffHar;
            if (ffHar) {
              ffHars.push(ffHar);
            }
            return iterationData;
          });
          if (ffHars.length > 0) {
            result.ffHar = harBuilder.mergeHars(ffHars);
          }
        }
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
