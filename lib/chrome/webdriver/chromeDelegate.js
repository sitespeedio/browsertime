'use strict';

const log = require('intel').getLogger('browsertime.chrome');
const { promisify } = require('util');
const { Type } = require('selenium-webdriver').logging;
const harBuilder = require('../../support/har/');
const perflogParser = require('chrome-har');
const fs = require('fs');
const { parseCpuTrace } = require('../cpu');
const webdriver = require('selenium-webdriver');
const zlib = require('zlib');
const traceCategoriesParser = require('../traceCategoriesParser');
const pathToFolder = require('../../support/pathToFolder');
const path = require('path');

const unlink = promisify(fs.unlink);

const { createAndroidConnection } = require('../../android');

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
  constructor(storageManager, options) {
    this.options = options;
    this.chrome = options.chrome || {};
    this.skipHar = options.skipHar || false;
    this.logPerfEntries = !!this.chrome.collectPerfLog;
    this.collectTracingEvents =
      this.chrome.traceCategories || this.chrome.timeline;
    this.baseDir = storageManager.directory;
    this.storageManeger = storageManager;
  }

  async onStart() {
    this.hars = [];
  }

  async onStartIteration(runner) {
    // Make sure we clear the console log
    // Hopefully one time is enough?
    await runner.getLogs(Type.BROWSER);

    // remove irrelevant entries from performance log
    // and since Chromedriver 2.29 there's a bug
    // https://bugs.chromium.org/p/chromedriver/issues/detail?id=1811
    // that can be fixed by emptying the logs twice :|
    await runner.getLogs(Type.PERFORMANCE);
    await runner.getLogs(Type.PERFORMANCE);

    if (this.skipHar) {
      return;
    }
  }

  async clear(runner) {
    await runner.getLogs(Type.PERFORMANCE);
    await runner.getLogs(Type.PERFORMANCE);
  }

  async onStopIteration() {}

  async onCollect(runner, index, result) {
    if (this.chrome.collectNetLog && !this.chrome.android) {
      const gzip = zlib.createGzip();
      const netlog = `${this.baseDir}/chromeNetlog.json`;
      const input = fs.createReadStream(netlog);
      const out = fs.createWriteStream(
        path.join(
          this.baseDir,
          pathToFolder(result.url, this.options),
          `chromeNetlog-${index}.json.gz`
        )
      );
      out.on('finish', function() {
        return unlink(netlog);
      });
      input.pipe(gzip).pipe(out);
    }

    if (this.chrome.collectConsoleLog) {
      result.extraJson[`console-${index}.json`] = await runner.getLogs(
        webdriver.logging.Type.BROWSER
      );
    }

    if (this.chrome.collectNetLog && this.chrome.android) {
      const android = createAndroidConnection(this.options);
      await android.initConnection();
      // THIS needs to be unique per page
      await android.pullNetLog(
        path.join(
          this.baseDir,
          pathToFolder(result.url, this.options),
          `chromeNetlog-${index}.json.gz`
        )
      );
    }

    if (this.skipHar) {
      return;
    }

    log.debug('Getting performance logs from Chrome');

    const logs = await runner.getLogs(Type.PERFORMANCE);
    const messages = logs.map(entry => JSON.parse(entry.message).message);

    if (this.logPerfEntries) {
      result.extraJson[`chromePerflog-${index}.json`] = messages;
    }
    if (this.collectTracingEvents) {
      const trace = traceCategoriesParser.parse(messages);
      result.extraJson[`trace-${index}.json`] = trace;
      const cpu = await parseCpuTrace(trace);
      result.cpu = cpu;
    }
    // CLEANUP since Chromedriver 2.29 there's a bug
    // https://bugs.chromium.org/p/chromedriver/issues/detail?id=1811
    await runner.getLogs(Type.PERFORMANCE);

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
      har.log.pages[0].title = `${result.url} run ${index}`;
      // Hack to add the URL from a SPA
      har.log.pages[0]._url = result.url;
    }

    this.hars.push(har);
  }

  async onStop() {
    if (!this.skipHar) {
      return { har: harBuilder.mergeHars(this.hars) };
    } else return {};
  }
}

module.exports = ChromeDelegate;
