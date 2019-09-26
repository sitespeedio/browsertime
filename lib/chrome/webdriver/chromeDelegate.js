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
const zlib = require('zlib');
const images = require('../../support/images');
const traceCategoriesParser = require('../traceCategoriesParser');
const pathToFolder = require('../../support/pathToFolder');
const path = require('path');
const speedline = require('speedline-core');
const visualMetricsExtra = require('../../video/postprocessing/visualmetrics/extraMetrics');
const ChromeDevtoolsProtocol = require('./chromeDevtoolsProtocol');
const { createAndroidConnection } = require('../../android');
const unlink = promisify(fs.unlink);

const CHROME_NAME_AND_VERSION_JS = `return (function() {
  const match = navigator.userAgent.match(/(Chrom(e|ium))\\/(([0-9]+\\.?)*)/);

  if (match)
    return {
      'name': match[1],
      'version': match[3]
    };
  else
    return {};
})();`;

function pad(n) {
  const extraZeroes = 6 - n.toString().length;
  for (let i = 0; i < extraZeroes; i++) {
    n = '0' + n;
  }
  return n;
}

class ChromeDelegate {
  constructor(storageManager, options) {
    this.options = options;
    this.chrome = options.chrome || {};
    this.skipHar = options.skipHar || false;
    this.logPerfEntries = !!this.chrome.collectPerfLog;
    this.collectTracingEvents =
      this.chrome.traceCategories || this.chrome.timeline;
    this.baseDir = storageManager.directory;
    this.storageManager = storageManager;
    // We keep track of all alias and URLs
    this.aliasAndUrl = {};
    this.isTracing = false;
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
    this.cdpClient = new ChromeDevtoolsProtocol(this.options);
    return this.cdpClient.setup();
  }

  async onStartIteration(runner) {
    if (this.options.injectJs) {
      await this.cdpClient.injectJavaScript(this.options.injectJs);
    }

    if (this.options.block) {
      await this.cdpClient.blockUrls(this.options.block);
    }

    if (this.options.cacheClearRaw) {
      await this.cdpClient.clearBrowserCache();
      await this.cdpClient.clearBrowserCookies();
    }

    if (this.options.clearCacheKeepCookies) {
      await this.cdpClient.clearBrowserCache();
    }

    if (this.options.basicAuth) {
      await this.cdpClient.setBasicAuth(this.options.basicAuth);
    }

    if (this.options.requestheader) {
      await this.cdpClient.setRequestHeaders(this.options.requestheader);
    }

    if (this.chrome.collectLongTasks) {
      await this.cdpClient.setupLongTask();
    }

    if (this.chrome.CPUThrottlingRate && this.chrome.CPUThrottlingRate > 1) {
      await this.cdpClient.setupCPUThrottling(this.chrome.CPUThrottlingRate);
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

  async onStopIteration() {
    if (this.chrome.collectNetLog && !this.chrome.android) {
      const netlog = `${this.baseDir}/chromeNetlog.json`;
      return unlink(netlog);
    }
  }

  async beforeEachURL(url) {
    if (this.options.cookie && url) {
      await this.cdpClient.setCookies(url, this.options.cookie);
    } else if (this.options.cookie) {
      log.info('Could not set cookie because the URL is unknown');
    }

    if (this.collectTracingEvents && !this.isTracing) {
      this.isTracing = true;
      return this.cdpClient.startTrace();
    }
  }

  async beforeCollect() {
    if (this.collectTracingEvents) {
      // We are ready and can stop collecting events
      this.isTracing = false;
      this.events = await this.cdpClient.stopTrace();
    }
  }

  async onCollect(runner, index, result) {
    if (this.chrome.collectNetLog && !this.chrome.android) {
      await this.storageManager.createSubDataDir(
        path.join(pathToFolder(result.url, this.options))
      );

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
        // return unlink(netlog);
      });
      out.on('error', function(e) {
        log.error('Could not gzip the Chrome net log', e);
      });
      input.pipe(gzip).pipe(out);
    }

    if (this.chrome.collectConsoleLog) {
      result.extraJson[`console-${index}.json`] = await runner.getLogs(
        webdriver.logging.Type.BROWSER
      );
    }

    const rawCDPMetrics = await this.cdpClient.getPerformanceMetrics();

    const cleanedMetrics = {};
    let ns, fmp;
    for (let m of rawCDPMetrics.metrics) {
      if (m.name === 'DomContentLoaded' || m.name === 'Timestamp') {
        // skip
      } else if (m.name === 'FirstMeaningfulPaint') {
        fmp = m.value;
      } else if (m.name === 'NavigationStart') {
        ns = m.value;
      } else {
        if (m.name.indexOf('Duration') > -1) {
          cleanedMetrics[m.name] = m.value * 1000;
        } else {
          cleanedMetrics[m.name] = m.value;
        }
      }
    }
    cleanedMetrics['FirstMeaningfulPaint'] = (fmp - ns) * 1000;

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

      if (
        this.chrome.enableTraceScreenshots &&
        this.chrome.visualMetricsUsingTrace &&
        this.options.cpu
      ) {
        try {
          const navStart = trace.traceEvents.filter(
            task =>
              task.cat === 'blink.user_timing' &&
              task.name === 'navigationStart'
          );
          navStart.sort(function(a, b) {
            return a.ts - b.ts;
          });
          log.debug('Get Speedline result from the trace');
          const speedlineResult = await speedline(trace.traceEvents, {
            timeOrigin: navStart[0].ts,
            fastMode: true
          });
          log.debug('Got Speedline result.');
          const startTs = speedlineResult.beginning;
          const visualProgress = speedlineResult.frames
            .map(frame => {
              const ts = Math.floor(frame.getTimeStamp() - startTs);
              return `${ts}=${Math.floor(frame.getProgress())}%`;
            })
            .join(', ');

          result.visualMetrics = visualMetricsExtra({
            FirstVisualChange: Number(speedlineResult.first.toFixed(0)),
            LastVisualChange: Number(speedlineResult.complete.toFixed(0)),
            SpeedIndex: Number(speedlineResult.speedIndex.toFixed(0)),
            PerceptualSpeedIndex: Number(
              speedlineResult.perceptualSpeedIndex.toFixed(0)
            ),
            VisualProgress: visualProgress
          }).visualMetrics;

          const promises = [];
          for (let frame of speedlineResult.frames) {
            // follow the name standard of Visual Metrics
            // ms_000000.jpg
            const d = new Date(frame.getTimeStamp() - startTs);
            const name = 'ms_' + pad(d.getTime());
            promises.push(
              images.saveJpg(
                name,
                frame.getImage(),
                result.url,
                this.storageManager,
                {
                  type: 'jpg',
                  jpg: {
                    quality: 80
                  },
                  maxSize: 400
                },
                path.join('filmstrip', index + ''),
                this.options
              )
            );
          }

          await Promise.all(promises);
        } catch (e) {
          log.error('Could not generate Visual Metrics using SpeedLine', e);
        }
      }
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

    if (
      this.chrome.includeResponseBodies === 'html' ||
      this.chrome.includeResponseBodies === 'all'
    ) {
      await this.cdpClient.setResponseBodies(har);
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
