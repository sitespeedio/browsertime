'use strict';

const Promise = require('bluebird'),
  log = require('intel'),
  BrowserError = require('../../support/errors').BrowserError,
  remove = require('lodash.remove'),
  harBuilder = require('../../support/harBuilder');

class FirefoxDelegate {
  constructor({ skipHar = false }) {
    this.skipHar = skipHar;
  }

  onStartRun() {
    this.index = 1;
    this.hars = [];
    return Promise.resolve();
  }

  onStartIteration() {
    return Promise.resolve();
  }

  onStopIteration(runner) {
    if (this.skipHar) {
      return Promise.resolve();
    }

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
                  har.log.pages[0].title = document.title;
                  return callback({'har': JSON.stringify(har)});
              })
              .catch((e) => callback({'error': e}));
            };
            if (typeof HAR === 'undefined') {
              addEventListener('har-api-ready', triggerExport, false);
            } else {
              triggerExport();
            }`;
    return runner
      .runAsyncScript(script, 'GET_HAR_SCRIPT')
      .then(reply => {
        if (reply.error) {
          throw new BrowserError('Error in Firefox HAR generation', {
            cause: reply.error
          });
        } else {
          return reply.har;
        }
      })
      .then(JSON.parse)
      .then(har => {
        har.log.pages[0].title += ' run ' + this.index;

        // Firefox inlude entries in the HAR that are from the local cache
        // and adds them with a time of 0.
        // lets remove them.
        remove(har.log.entries, function(entry) {
          return entry.time === 0;
        });
        this.hars.push(har);
        this.index++;
      })
      .catch(e => {
        log.error(
          "Couldn't generate the HAR from Firefox from the HAR Export Trigger."
        );
        throw e;
      });
  }

  onStopRun(result) {
    if (!this.skipHar && this.hars.length > 0) {
      result.har = harBuilder.mergeHars(this.hars);
    }

    return Promise.resolve();
  }
}

module.exports = FirefoxDelegate;
