'use strict';

/*eslint no-restricted-modules:0*/

let Promise = require('bluebird'),
  fs = require('fs'),
  path = require('path'),
  merge = require('lodash.merge'),
  webdriver = require('selenium-webdriver'),
  fileNamer = require('../../support/fileNamer').fileNamer,
  harBuilder = require('../../support/harBuilder'),
  perflogParser = require('../../support/chromePerflogParser'),
  trafficShapeParser = require('../../support/trafficShapeParser');

Promise.promisifyAll(fs);

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

const PAGE_TITLE_JS = `return document.title;`;

const defaults = {
  experimental: {}
};

class ChromeDelegate {
  constructor(options) {
    options = merge({}, defaults, options);

    this.trafficShapeConfig = trafficShapeParser.parseTrafficShapeConfig(options);

    this.logPerfEntries = options.experimental.dumpChromePerflog;

    if (this.trafficShapeConfig || options.basicAuth || options.skipHar) {
      throw new Error('Chrome native har can\'t be combined with custom connection speeds, ' +
        'basic auth or skipping har generation.');
    }
  }

  onStart() {
    return Promise.resolve();
  }

  onStartRun(url) {
    this.hars = [];
    this.currentUrl = url;
    return Promise.resolve();
  }

  onStartIteration() {
    return Promise.resolve();
  }

  onStopIteration(runner, index) {
    return runner.getLogs(webdriver.logging.Type.PERFORMANCE)
      .tap((entries) => {
        if (this.logPerfEntries) {
          const namer = fileNamer();

          let filePath = namer.getNameFromUrl(this.currentUrl, 'json');
          filePath = filePath.slice(0, -5) + '-perflog-' + index + '.json';

          return fs.writeFileAsync(path.resolve('browsertime-results', filePath), JSON.stringify(entries), 'utf-8');
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
    if (this.hars.length > 0) {
      result.har = harBuilder.mergeHars(this.hars);
    }

    return Promise.resolve();
  }

  onStop() {
    return Promise.resolve();
  }
}

module.exports = ChromeDelegate;
