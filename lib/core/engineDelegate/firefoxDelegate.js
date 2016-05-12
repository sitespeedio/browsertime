'use strict';

let Promise = require('bluebird'),
  log = require('intel'),
  harBuilder = require('../../support/harBuilder'),
  trafficShapeParser = require('../../support/trafficShapeParser');

class FirefoxDelegate {
  constructor(options) {
    this.trafficShapeConfig = trafficShapeParser.parseTrafficShapeConfig(options);
    this.skipHar = options.skipHar;

    if (this.trafficShapeConfig || options.basicAuth) {
      throw new Error('Firefox native har can\'t be combined with custom connection speeds or basic auth.');
    }
  }

  onStart() {
    return Promise.resolve();
  }

  onStartRun() {
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
    return runner.runAsyncScript(script, 'GET_HAR_SCRIPT').then((reply) => {
      if (reply.error) {
        log.warn('Error from Firefox HAR generation: ' + JSON.stringify(reply.error));
        throw reply.error;
      } else {
        return reply.har;
      }
    }).then(JSON.parse).then((har) => {
      // TODO potentially remove incomplete entries, such as with response.status=0 or time=null
      this.hars.push(har);
    });
  }

  onStopRun(result) {
    if (!this.skipHar && this.hars.length > 0) {
      result.har = harBuilder.mergeHars(this.hars);
    }

    return Promise.resolve();
  }

  onStop() {
    return Promise.resolve();
  }
}

module.exports = FirefoxDelegate;
