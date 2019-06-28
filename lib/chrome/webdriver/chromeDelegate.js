'use strict';

const log = require('intel').getLogger('browsertime.chrome');
const { promisify } = require('util');
const { Type } = require('selenium-webdriver').logging;
const get = require('lodash.get');
const harBuilder = require('../../support/har/');
const perflogParser = require('chrome-har');
const fs = require('fs');
const { parseCpuTrace } = require('../cpu');
const webdriver = require('selenium-webdriver');
const util = require('../../support/util');
const zlib = require('zlib');
const traceCategoriesParser = require('../traceCategoriesParser');
const pathToFolder = require('../../support/pathToFolder');
const path = require('path');
const CDP = require('chrome-remote-interface');

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
    // We keep track of all alias and URLs
    this.aliasAndUrl = {};
    this.isTracing = false;

    this.chromeTraceCategories = this.chrome.traceCategories
      ? this.chrome.traceCategories.split(',')
      : [
          '-*',
          'disabled-by-default-lighthouse',
          'v8',
          'v8.execute',
          'blink.user_timing',
          'devtools.timeline',
          'disabled-by-default-devtools.timeline',
          'disabled-by-default-devtools.timeline.stack'
        ];
    if (this.chrome.enableTraceScreenshots) {
      this.chromeTraceCategories.push(
        'disabled-by-default-devtools.screenshot'
      );
    }

    if (this.chrome.traceCategories) {
      log.info('Use Chrome trace categories: %s', this.chrome.traceCategories);
    }
  }

  async _startTrace() {
    this.events = [];
    this.cdpClient.Tracing.dataCollected(({ value }) => {
      this.events.push(...value);
    });

    this.isTracing = true;
    return this.cdpClient.Tracing.start({
      traceConfig: {
        recordMode: 'recordAsMuchAsPossible',
        includedCategories: this.chromeTraceCategories
      }
    });
  }
  async onStart() {
    this.hars = [];
    this.events = [];
    if (this.chrome.android) {
      this.android = createAndroidConnection(this.options);
      return this.android.initConnection();
    }
  }

  async afterBrowserStart() {
    // We create the cdp as early as possibble so it can be used in scripts
    // https://bugs.chromium.org/p/chromium/issues/detail?id=824626
    // https://github.com/cyrus-and/chrome-remote-interface/issues/332
    if (this.chrome.android) {
      this.cdpClient = await CDP({
        local: true,
        port: this.options.devToolsPort
      });
    } else {
      this.cdpClient = await CDP({});
    }

    return this.cdpClient.Page.enable();
  }

  async onStartIteration(runner) {
    // enable getting extra performance metrics
    if (this.chrome.cdp && this.chrome.cdp.performance === true) {
      await this.cdpClient.Performance.enable();
    }

    if (this.options.injectJs) {
      await this.cdpClient.Page.addScriptToEvaluateOnNewDocument({
        source: this.options.injectJs
      });
    }

    if (this.options.requestheader) {
      const headersArray = util.toArray(this.options.requestheader);
      const headers = {};
      for (let header of headersArray) {
        const parts = header.split(':');
        headers[parts[0]] = parts[1];
      }
      await this.cdpClient.Network.enable();
      await this.cdpClient.Network.setExtraHTTPHeaders({
        headers
      });
    }

    if (this.chrome.collectLongTasks) {
      const source = `
      !function() {
        let lt = window.__bt_longtask={e:[]};
        lt.o = new PerformanceObserver(function(a) {
          lt.e=lt.e.concat(a.getEntries());
        });
        lt.o.observe({entryTypes:['longtask']});
      }();`;

      await this.cdpClient.Page.addScriptToEvaluateOnNewDocument({ source });
    }

    if (this.chrome.CPUThrottlingRate && this.chrome.CPUThrottlingRate > 1) {
      log.info('Using CPUThrottlingRate: %s', this.chrome.CPUThrottlingRate);
      await this.cdpClient.Emulation.setCPUThrottlingRate({
        rate: this.chrome.CPUThrottlingRate
      });
    }

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

  async beforeEachURL() {
    if (this.collectTracingEvents && !this.isTracing) {
      return this._startTrace();
    }
  }

  async beforeCollect() {
    if (this.collectTracingEvents) {
      // We are ready and can stop collecting events
      await this.cdpClient.Tracing.end();
      this.isTracing = false;
      return this.cdpClient.Tracing.tracingComplete();
    }
  }

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

    const rawCDPMetrics = await this.cdpClient.Performance.getMetrics();

    const cleanedMetrics = {};
    for (let m of rawCDPMetrics.metrics) {
      if (
        m.name === 'FirstMeaningfulPaint' ||
        m.name === 'DomContentLoaded' ||
        m.name === 'Timestamp' ||
        m.name === 'NavigationStart'
      ) {
        // skip
      } else {
        if (m.name.indexOf('Duration') > -1) {
          cleanedMetrics[m.name] = m.value * 1000;
        } else {
          cleanedMetrics[m.name] = m.value;
        }
      }
    }

    result.cdp = { performance: cleanedMetrics };

    if (this.chrome.collectNetLog && this.chrome.android) {
      // THIS needs to be unique per page
      await this.android.pullNetLog(
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
      const trace = traceCategoriesParser.parse(this.events, result.url);
      result.extraJson[`trace-${index}.json`] = trace;
      const cpu = await parseCpuTrace(trace, result.url);
      result.cpu = cpu;
    }

    // lets take the time and format the CPU long tasks
    if (
      result.browserScripts.pageinfo &&
      result.browserScripts.pageinfo.longTask
    ) {
      let totalDurationFirstPaint = 0;
      let totalDurationFirstContentFulPaint = 0;
      let totalDurationAfterLoadEventEnd = 0;
      let totalDuration = 0;
      const firstPaint = get(
        result,
        'browserScripts.timings.paintTiming.first-paint'
      );
      const firstContentfulPaint = get(
        result,
        'browserScripts.timings.paintTiming.first-contentful-paint'
      );

      const loadEventEnd = get(result, 'browserScripts.timings.loadEventEnd');

      let longTasksBeforeFirstPaint = 0;
      let longTasksBeforeFirstContentfulPaint = 0;
      let longTasksAfterLoadEventEnd = 0;

      for (let longTask of result.browserScripts.pageinfo.longTask) {
        totalDuration += longTask.duration;
        if (firstPaint && longTask.startTime < firstPaint) {
          longTasksBeforeFirstPaint++;
          totalDurationFirstPaint += longTask.duration;
        }
        if (firstContentfulPaint && longTask.startTime < firstContentfulPaint) {
          longTasksBeforeFirstContentfulPaint++;
          totalDurationFirstContentFulPaint += longTask.duration;
        }
        if (loadEventEnd && longTask.startTime > loadEventEnd) {
          longTasksAfterLoadEventEnd++;
          totalDurationAfterLoadEventEnd += longTask.duration;
        }
      }
      const cpu = {
        longTasks: {
          tasks: result.browserScripts.pageinfo.longTask.length,
          totalDuration,
          beforeFirstPaint: {
            tasks: longTasksBeforeFirstPaint,
            totalDuration: totalDurationFirstPaint
          },
          beforeFirstContentfulPaint: {
            tasks: longTasksBeforeFirstContentfulPaint,
            totalDuration: totalDurationFirstContentFulPaint
          },
          afterLoadEventEnd: {
            tasks: longTasksAfterLoadEventEnd,
            totalDuration: totalDurationAfterLoadEventEnd
          }
        }
      };

      if (result.cpu) {
        result.cpu.longTasks = cpu.longTasks;
      } else {
        result.cpu = cpu;
      }
    }

    // CLEANUP since Chromedriver 2.29 there's a bug
    // https://bugs.chromium.org/p/chromedriver/issues/detail?id=1811
    await runner.getLogs(Type.PERFORMANCE);

    const har = perflogParser.harFromMessages(messages);

    if (this.chrome.includeResponseBodies === 'html') {
      const resourceTree = await this.cdpClient.Page.getResourceTree();
      const url = resourceTree.frameTree.frame.url;
      try {
        const html = await this.cdpClient.Page.getResourceContent({
          frameId: resourceTree.frameTree.frame.id,
          url: resourceTree.frameTree.frame.url
        });

        for (let entry of har.log.entries) {
          if (entry.request.url === url) {
            entry.response.content.text = html.content;
          }
        }
      } catch (e) {
        log.error('Could not find a matching resource to get the HTML', e);
      }
    }

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
      if (result.alias && !this.aliasAndUrl[result.alias]) {
        this.aliasAndUrl[result.alias] = result.url;
        har.log.pages[0]._url = result.url;
      } else if (result.alias && this.aliasAndUrl[result.alias]) {
        har.log.pages[0]._url = this.aliasAndUrl[result.alias];
      } else {
        har.log.pages[0]._url = result.url;
      }
    }

    this.hars.push(har);
  }

  async sendAndGetDevToolsCommand(cmd, params = {}) {
    return this.cdpClient.send(cmd, params);
  }
  async sendDevToolsCommand(cmd, params = {}) {
    return this.cdpClient.send(cmd, params);
  }

  failing(url) {
    if (this.skipHar) {
      return;
    }
    this.hars.push(harBuilder.getEmptyHAR(url, 'Chrome'));
  }

  async onStop() {
    if (this.cdpClient) {
      await this.cdpClient.close();
    }
    if (this.chrome.android) {
      await this.android.removeFw();
    }
    if (!this.skipHar) {
      return { har: harBuilder.mergeHars(this.hars) };
    } else return {};
  }
}

module.exports = ChromeDelegate;
