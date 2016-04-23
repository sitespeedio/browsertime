'use strict';

let Promise = require('bluebird'),
  merge = require('lodash.merge'),
  webdriver = require('selenium-webdriver'),
  harBuilder = require('../../support/harBuilder'),
  perflogParser = require('../../support/chromePerflogParser'),
  trafficShapeParser = require('../../support/trafficShapeParser');

const CHROME_NAME_AND_VERSION_JS = `return (function() {
  var match = navigator.userAgent.match(/(Chrom(e|ium))\\/(([0-9]+\\.?)*)/);

  if (match)
    return {
      'name': match[1],
      'version': match[3]
    };
  else
    return {};
})();`;

const PAGE_TITLE_JS = 'return document.title;';

const defaults = {
  experimental: {}
};

class ChromeDelegate {
  constructor(options) {
    options = merge({}, defaults, options);

    this.trafficShapeConfig = trafficShapeParser.parseTrafficShapeConfig(options);
    this.skipHar = options.skipHar;
    this.logPerfEntries = options.experimental.dumpChromePerflog;

    if (this.trafficShapeConfig || options.basicAuth) {
      throw new Error('Chrome native har can\'t be combined with custom connection speeds or basic auth.');
    }
  }

  onStart() {
    return Promise.resolve();
  }

  onStartRun() {
    this.hars = [];
    return Promise.resolve();
  }

  onStartIteration(runner) {
    if (this.skipHar) {
      return Promise.resolve();
    }

    // remove irrelevant entries from performance log
    return runner.getLogs(webdriver.logging.Type.PERFORMANCE);
  }

  onStopIteration(runner, index, results) {
    if (this.skipHar) {
      return Promise.resolve();
    }

    return runner.getLogs(webdriver.logging.Type.PERFORMANCE)
      .tap((entries) => {
        if (this.logPerfEntries) {
          results.extras['chromePerflog-' + index + '.json'] = JSON.stringify(entries);
        }
      })
      .map((entry) => perflogParser.eventFromSeleniumLogEntry(entry))
      .then((events) => perflogParser.harFromEvents(events))
      .then((har) => runner.runScript(CHROME_NAME_AND_VERSION_JS)
        .then((browserInfo) => harBuilder.addBrowser(har, browserInfo.name, browserInfo.version)))
      .then((har) => {
        if (har.log.pages.length > 0) {
          return runner.runScript(PAGE_TITLE_JS)
            .then((title) => {
              har.log.pages[0].title = title;
              return har;
            });
        } else {
          // FIXME this is to avoid a crash, but should have better error handling in this case.
          return har;
        }
      })
      .then((har) => {
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

module.exports = ChromeDelegate;
