'use strict';

const BrowserError = require('../../support/errors').BrowserError;
const remove = require('lodash.remove');
const harBuilder = require('../../support/harBuilder');

class FirefoxDelegate {
  constructor({ skipHar = false }) {
    this.skipHar = skipHar;
  }

  async onStartRun() {
    this.index = 1;
    this.hars = [];
  }

  async onStartIteration() {}

  async onStopIteration(runner) {
    if (this.skipHar) {
      return;
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

    const harResult = await runner.runAsyncScript(script, 'GET_HAR_SCRIPT');
    if (harResult.error) {
      throw new BrowserError('Error in Firefox HAR generation', {
        cause: harResult.error
      });
    }
    const har = JSON.parse(harResult.har);
    har.log.pages[0].title += ' run ' + this.index;

    // Firefox inlude entries in the HAR that are from the local cache
    // and adds them with a time of 0.
    // lets remove them.
    remove(har.log.entries, function(entry) {
      return entry.time === 0;
    });
    this.hars.push(har);
    this.index++;
  }

  async onStopRun(result) {
    if (!this.skipHar && this.hars.length > 0) {
      result.har = harBuilder.mergeHars(this.hars);
    }
  }
}

module.exports = FirefoxDelegate;
