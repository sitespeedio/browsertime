'use strict';

let Promise = require('bluebird'),
  webdriver = require('selenium-webdriver'),
  harBuilder = require('../../support/har_builder'),
  perflogParser = require('../../support/chrome-perflog-parser'),
  trafficShapeParser = require('../../support/traffic_shape_parser');

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

class ChromeDelegate {
  constructor(options) {
    this.trafficShapeConfig = trafficShapeParser.parseTrafficShapeConfig(options);

    if (this.trafficShapeConfig || options.basicAuth || options.skipHar) {
      throw new Error('Chrome native har can\'t be combined with custom connection speeds, ' +
        'basic auth or skipping har generation.');
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
    return runner.getLogs(webdriver.logging.Type.PERFORMANCE)
      .map((entry) => perflogParser.eventFromLogEntry(entry))
      .then((events) => perflogParser.harFromEvents(events))
      .then((har) => runner.runScript(CHROME_NAME_AND_VERSION_JS)
        .then((browserInfo) => harBuilder.addBrowser(har, browserInfo.name, browserInfo.version)))
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
