'use strict';

const log = require('intel').getLogger('browsertime.chrome');
const { promisify } = require('util');
const { Type } = require('selenium-webdriver').logging;
const cpuMetrics = require('../longTaskMetrics');
const fs = require('fs');
const path = require('path');
const parseCpuTrace = require('../parseCpuTrace');
const har = require('../har');
const harBuilder = require('../../support/har');
const util = require('../../support/util');
const webdriver = require('selenium-webdriver');
const traceCategoriesParser = require('../traceCategoriesParser');
const pathToFolder = require('../../support/pathToFolder');
const ChromeDevtoolsProtocol = require('../chromeDevtoolsProtocol');
const { Android } = require('../../android');
const unlink = promisify(fs.unlink);
const rm = promisify(fs.rm);

class Chromium {
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
    // Keep the HAR file for all runs
    this.hars = [];
    this.androidTmpDir = '/data/local/tmp/';
  }

  /**
   * Before the brrowser is started.
   */
  async beforeBrowserStart() {
    this.events = [];
    if (this.options.android) {
      this.android = new Android(this.options);
      if (this.options.androidPower) {
        await this.android.startPowerTesting();
      }

      if (this.chrome.collectNetLog) {
        // The file needs to exist for netlog to work
        await this.android._runCommand(
          `touch ${this.androidTmpDir}chromeNetlog.json`
        );
      }
    }
  }

  /**
   * The browser is up and running, now its time to start to
   * configure what you need.
   */
  async afterBrowserStart() {
    // We create the cdp as early as possible so it can be used in scripts
    // https://bugs.chromium.org/p/chromium/issues/detail?id=824626
    // https://github.com/cyrus-and/chrome-remote-interface/issues/332
    if (this.options.android) {
      await this.android.addDevtoolsFw();
    }

    this.cdpClient = new ChromeDevtoolsProtocol(this.options);
    return this.cdpClient.setup();
  }

  /**
   * Before the first iteration of your tests start.
   */
  async beforeStartIteration(runner) {
    // Here we setup everything we need using CDP
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

    if (this.chrome.CPUThrottlingRate && this.chrome.CPUThrottlingRate > 1) {
      await this.cdpClient.setupCPUThrottling(this.chrome.CPUThrottlingRate);
    }

    if (this.chrome.appendToUserAgent || this.options.appendToUserAgent) {
      const currentUserAgent = await runner.runScript(
        'return navigator.userAgent;',
        'GET_USER_AGENT'
      );
      await this.cdpClient.setUserAgent(
        currentUserAgent +
          ' ' +
          (this.chrome.appendToUserAgent || this.options.appendToUserAgent)
      );
    } else if (this.chrome.mobileEmulation && this.options.userAgent) {
      // Hack to set user agent for mobile emulation
      await this.cdpClient.setUserAgent(this.options.userAgent);
    }

    await this.cdpClient.setupLongTask();

    await this.cdpClient.loadingFailed();

    // Make sure we clear the console log
    // Hopefully one time is enough?
    return runner.getLogs(Type.BROWSER);

    // remove irrelevant entries from performance log
    // and since Chromedriver 2.29 there's a bug
    // https://bugs.chromium.org/p/chromedriver/issues/detail?id=1811
    // that can be fixed by emptying the logs twice :|
    // await runner.getLogs(Type.PERFORMANCE);
    // await runner.getLogs(Type.PERFORMANCE);
  }

  /**
   * Before each URL/test runs.
   */
  async beforeEachURL(runner, url) {
    // remove irrelevant entries from performance log
    // and since Chromedriver 2.29 there's a bug
    // https://bugs.chromium.org/p/chromedriver/issues/detail?id=1811s
    await runner.getLogs(Type.PERFORMANCE);
    await runner.getLogs(Type.PERFORMANCE);

    if (this.options.cookie && url) {
      await this.cdpClient.setCookies(url, this.options.cookie);
    } else if (this.options.cookie) {
      log.info('Could not set cookie because the URL is unknown');
    }

    if (this.android && this.options.androidPower) {
      await this.android.resetPowerUsage();
    }

    if (this.collectTracingEvents && !this.isTracing) {
      this.isTracing = true;
      return this.cdpClient.startTrace();
    }
  }

  /**
   * When the page has finished loading, this functions runs (before
   * collecting metrics etc). This is the place to get you HAR file,
   * stop trace logging, stop measuring etc.
   *
   */
  async afterPageCompleteCheck(runner, index, url, alias) {
    const result = { url, alias };
    if (this.collectTracingEvents && this.isTracing) {
      // We are ready and can stop collecting events
      this.isTracing = false;
      this.events = await this.cdpClient.stopTrace();
    }

    if (this.android && this.options.androidPower) {
      result.power = await this.android.measurePowerUsage(
        this.chrome.android.package
      );
    }

    if (this.options.verbose >= 2 || this.chrome.enableChromeDriverLog) {
      await this.storageManager.gzip(
        `${this.baseDir}/chromedriver.log`,
        `${this.baseDir}/chromedriver-${index}.log.gz`,
        true
      );
    }

    if (this.chrome.collectNetLog && !this.chrome.android) {
      await this.storageManager.createSubDataDir(
        path.join(pathToFolder(result.url, this.options))
      );

      await this.storageManager.gzip(
        `${this.baseDir}/chromeNetlog.json`,
        path.join(
          this.baseDir,
          pathToFolder(result.url, this.options),
          `chromeNetlog-${index}.json.gz`
        )
      );
    }

    if (this.chrome.collectConsoleLog) {
      if (!result.extraJson) {
        result.extraJson = {};
      }
      result.extraJson[`console-${index}.json`] = await runner.getLogs(
        webdriver.logging.Type.BROWSER
      );
    }

    if (!this.skipHar) {
      this.hars.push(
        await har(
          runner,
          result,
          index,
          this.cdpClient,
          this.logPerfEntries,
          this.chrome.includeResponseBodies,
          this.chrome.mobileEmulation,
          this.android,
          this.chrome,
          this.aliasAndUrl
        )
      );
    }

    if (this.chrome.cdp && this.chrome.cdp.performance) {
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
    }

    return result;
  }

  /**
   * The URL/test is finished, all metrics are collected.
   */
  async afterEachURL(runner, index, result) {
    if (this.chrome.collectNetLog && this.chrome.android) {
      // THIS needs to be unique per page
      const filename = path.join(
        this.baseDir,
        pathToFolder(result.url, this.options),
        `chromeNetlog-${index}.json`
      );

      const gzFilename = path.join(
        this.baseDir,
        pathToFolder(result.url, this.options),
        `chromeNetlog-${index}.json.gz`
      );
      await this.android.pullNetLog(filename);

      await this.storageManager.gzip(filename, gzFilename, true);
    }

    if (this.collectTracingEvents) {
      const trace = traceCategoriesParser.parse(this.events, result.url);
      result.extraJson[`trace-${index}.json`] = trace;
      const cpu = await parseCpuTrace(trace, result.url);
      result.cpu = cpu;

      // Collect render blocking info
      const renderBlockingInfo = {};
      const urlsWithBlockingInfo = trace.traceEvents.filter(
        task =>
          task.cat === 'devtools.timeline' &&
          task.name === 'ResourceSendRequest' &&
          task.args.data.url &&
          task.args.data.renderBlocking
      );
      for (let asset of urlsWithBlockingInfo) {
        renderBlockingInfo[asset.args.data.url] =
          asset.args.data.renderBlocking;
      }

      if (!this.options.skipHar) {
        for (let harRequest of this.hars[index - 1].log.entries) {
          if (renderBlockingInfo[harRequest.request.url]) {
            harRequest._renderBlocking =
              renderBlockingInfo[harRequest.request.url];
          }
        }
      }

      result.renderBlocking = renderBlockingInfo;
    }

    // Google Web Vitals hacksery
    result.googleWebVitals = {};
    if (result.browserScripts.pageinfo) {
      result.googleWebVitals.cumulativeLayoutShift =
        result.browserScripts.pageinfo.cumulativeLayoutShift;
    }
    if (result.browserScripts.timings) {
      if (result.browserScripts.timings.ttfb) {
        result.googleWebVitals.ttfb = result.browserScripts.timings.ttfb;
      }

      if (result.browserScripts.timings.largestContentfulPaint) {
        result.googleWebVitals.largestContentfulPaint =
          result.browserScripts.timings.largestContentfulPaint.renderTime ||
          result.browserScripts.timings.largestContentfulPaint.loadTime;
      }

      if (
        result.browserScripts.timings.paintTiming &&
        result.browserScripts.timings.paintTiming['first-contentful-paint']
      ) {
        result.googleWebVitals.firstContentfulPaint =
          result.browserScripts.timings.paintTiming['first-contentful-paint'];
        result.googleWebVitals.firstInputDelay = result.browserScripts.timings
          .firstInput
          ? result.browserScripts.timings.firstInput.delay
          : 0;
      }

      if (result.browserScripts.timings.interactionToNextPaint) {
        result.googleWebVitals.interactionToNextPaint =
          result.browserScripts.timings.interactionToNextPaint;
      }

      // Add LCP to the HAR
      if (
        result.browserScripts.timings.largestContentfulPaint &&
        result.browserScripts.timings.largestContentfulPaint.tagName ===
          'IMG' &&
        !this.options.skipHar
      ) {
        for (let harRequest of this.hars[index - 1].log.entries) {
          if (
            harRequest.request.url ===
            result.browserScripts.timings.largestContentfulPaint.url
          ) {
            harRequest._isLCP = true;
          }
        }
      }
    }

    // lets take the time and format the CPU long tasks
    if (
      result.browserScripts.pageinfo &&
      result.browserScripts.pageinfo.longTask
    ) {
      const cpuData = cpuMetrics(result, this.options);
      if (result.cpu) {
        result.cpu.longTasks = cpuData.longTasks;
      } else {
        result.cpu = cpuData;
      }
      result.googleWebVitals.totalBlockingTime =
        cpuData.longTasks.totalBlockingTime;
    }
  }

  /**
   * Get the CDP client (used by scripting) for browsers that supports it.
   */
  getCDPClient() {
    return this.cdpClient;
  }

  /**
   * THis method is called if a runs fail
   */
  failing(url) {
    if (this.skipHar) {
      return;
    }
    this.hars.push(harBuilder.getEmptyHAR(url, this.options.browser));
  }

  /**
   * Before the browser is stopped/closed.
   */
  async beforeBrowserStop() {
    if (this.chrome.collectNetLog && !this.chrome.android) {
      const netlog = `${this.baseDir}/chromeNetlog.json`;
      await unlink(netlog);
    }

    if (this.android && this.options.androidPower) {
      await this.android.stopPowerTesting();
    }

    if (this.cdpClient) {
      await this.cdpClient.close();
    }
  }

  /**
   * Before the browser is stopped/closed.
   */
  async afterBrowserStopped() {
    // If we supply a user data dir on desktop, we want to clean up before each start
    if (
      this.chrome.args &&
      this.chrome.cleanUserDataDir &&
      !this.chrome.android
    ) {
      const args = util.toArray(this.chrome.args);
      for (let arg of args) {
        if (arg.includes('user-data-dir')) {
          const userDataDir = arg.split('=')[1];
          try {
            await rm(userDataDir, { recursive: true });
            log.info(`Deleted user data dir: ${userDataDir}`);
          } catch (e) {
            log.error(`Could not delete user data dir: ${userDataDir}`, e);
          }
        }
      }
    }
  }

  async getHARs() {
    if (!this.skipHar) {
      return { har: harBuilder.mergeHars(this.hars) };
    } else return {};
  }
}

module.exports = Chromium;
