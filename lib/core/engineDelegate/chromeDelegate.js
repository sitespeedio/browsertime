'use strict';

const Promise = require('bluebird'),
  log = require('intel'),
  merge = require('lodash.merge'),
  webdriver = require('selenium-webdriver'),
  harBuilder = require('../../support/harBuilder'),
  perflogParser = require('../../support/chromePerflogParser');

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

    this.skipHar = options.skipHar;
    this.logPerfEntries = options.experimental.dumpChromePerflog;
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

    log.debug('Getting performance logs from Chrome');

    return runner.getLogs(webdriver.logging.Type.PERFORMANCE)
      // need timeout to avoid hanging forever in case of error
      .timeout(10000, 'Extracting Chrome performance log took too long.')
      .map((entry) => perflogParser.eventFromSeleniumLogEntry(entry))
      .tap((events) => {
        if (this.logPerfEntries) {
          results.extraJson['chromePerflog-' + index + '.json'] = events;
        }
      })
      .then((events) => perflogParser.harFromEvents(events))
      .then((har) => runner.runScript(CHROME_NAME_AND_VERSION_JS, 'CHROME_NAME_AND_VERSION_JS')
        .then((browserInfo) => harBuilder.addBrowser(har, browserInfo.name, browserInfo.version)))
      .then((har) => {
        if (har.log.pages.length > 0) {
          return runner.runScript(PAGE_TITLE_JS, 'PAGE_TITLE_JS')
            .then((title) => {
              har.log.pages[0].title = title + ' run ' + (index + 1);
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
    result.har = harBuilder.mergeHars(this.hars);

    return Promise.resolve();
  }
}

module.exports = ChromeDelegate;
