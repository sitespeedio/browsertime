'use strict';

const log = require('intel');
const { Type } = require('selenium-webdriver').logging;
const harBuilder = require('../../support/harBuilder');
const perflogParser = require('chrome-har');
const traceCategoriesParser = require('../../support/traceCategoriesParser');

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

class ChromeDelegate {
  constructor({ skipHar = false, chrome = {} }) {
    this.skipHar = skipHar;
    this.logPerfEntries = !!chrome.collectPerfLog;
    this.collectTracingEvents = !!chrome.collectTracingEvents;
    this.chrome = chrome;
  }

  async onStartRun() {
    this.hars = [];
  }

  async onStartIteration(runner) {
    if (this.skipHar) {
      return;
    }

    // remove irrelevant entries from performance log
    // and since Chromedriver 2.29 there's a bug
    // https://bugs.chromium.org/p/chromedriver/issues/detail?id=1811
    // that can be fixed by emptying the logs twice :|
    await runner.getLogs(Type.PERFORMANCE);
    await runner.getLogs(Type.PERFORMANCE);
  }

  async onStopIteration(runner, index, results) {
    if (this.skipHar) {
      return;
    }

    log.debug('Getting performance logs from Chrome');

    const logs = await runner.getLogs(Type.PERFORMANCE);

    const messages = logs.map(entry => JSON.parse(entry.message).message);

    if (this.logPerfEntries) {
      results.extraJson[`chromePerflog-${index}.json`] = messages;
    }
    if (this.collectTracingEvents) {
      const trace = traceCategoriesParser.parse(messages);
      results.extraJson[`trace-${index}.json`] = trace;
    }

    const har = perflogParser.harFromMessages(messages);
    const info = await runner.runScript(
      CHROME_NAME_AND_VERSION_JS,
      'CHROME_NAME_AND_VERSION_JS'
    );
    if (this.chrome.mobileEmulation) {
      info.name = `Chrome Emulated ${this.chrome.mobileEmulation.deviceName}`;
    }
    harBuilder.addBrowser(har, info.name, info.version);

    if (har.log.pages.length > 0) {
      const title = await runner.runScript(PAGE_TITLE_JS, 'PAGE_TITLE_JS');
      har.log.pages[0].title = `${title} run ${index + 1}`;
    }

    this.hars.push(har);
  }

  async onStopRun(result) {
    result.har = harBuilder.mergeHars(this.hars);
  }
}

module.exports = ChromeDelegate;
