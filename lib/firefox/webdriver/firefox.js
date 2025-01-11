import { rename as _rename } from 'node:fs';
import { promisify } from 'node:util';
import path from 'node:path';
import { getLogger } from '@sitespeed.io/log';
import { adapters } from 'ff-test-bidi-har-export';
import { getEmptyHAR, mergeHars } from '../../support/har/index.js';
import { loadUsbPowerProfiler } from '../../support/usbPower.js';
import { pathToFolder } from '../../support/pathToFolder.js';
import { isAndroidConfigured, Android } from '../../android/index.js';
import {
  adjustVisualProgressTimestamps,
  getProperty
} from '../../support/util.js';
import { findFiles } from '../../support/fileUtil.js';
import { GeckoProfiler } from '../geckoProfiler.js';
import { FirefoxBidi } from '../firefoxBidi.js';
import { MemoryReport } from '../memoryReport.js';
import { PerfStats } from '../perfStats.js';
import { NetworkManager } from '../networkManager.js';

const log = getLogger('browsertime.firefox');
const rename = promisify(_rename);
export class Firefox {
  constructor(storageManager, options) {
    // Lets keep this and hope that we in the future will have HAR for FF again
    this.skipHar = options.skipHar;
    this.baseDir = storageManager.directory;
    this.storageManager = storageManager;
    this.includeResponseBodies = options.firefox
      ? options.firefox.includeResponseBodies
      : 'none';
    this.firefoxConfig = options.firefox || {};
    this.options = options;
    // We keep track of all alias and URLs
    this.aliasAndUrl = {};
    // This keep the HAR files for all runs
    this.hars = [];
    this.testStartTime = undefined;
  }

  /**
   * Before the browser is started.
   */
  async beforeBrowserStart() {
    if (isAndroidConfigured(this.options)) {
      this.android = new Android(this.options);
    }

    if (isAndroidConfigured(this.options) && this.options.androidPower) {
      await this.android.startPowerTesting();
    }
  }

  /**
   * The browser is up and running, now its time to start to
   * configure what you need.
   */
  async afterBrowserStart(runner) {
    this.windowId = await runner.getDriver().getWindowHandle();

    if (!this.options.skipHar) {
      this.har = new adapters.SeleniumBiDiHarRecorder({
        browsingContextIds: [this.windowId],
        debugLogs:
          this.options.verbose >= 2 || this.firefoxConfig.enableBidiHarLog,
        driver: runner.getDriver()
      });
    }

    this.bidi = await runner.getDriver().getBidi();

    this.browsertimeBidi = new FirefoxBidi(
      await runner.getDriver().getBidi(),
      this.windowId,
      runner.getDriver(),
      this.options
    );

    if (isAndroidConfigured(this.options) && this.options.androidUsbPower) {
      const usbPowerProfiler = await loadUsbPowerProfiler();
      if (usbPowerProfiler) {
        usbPowerProfiler.startSampling();
      }
    }
  }

  /**
   * Get the Bidi client (used by scripting) for browsers that supports it.
   */
  getBidi() {
    return this.bidi;
  }

  getWindowHandle() {
    return this.windowId;
  }

  /**
   * Before the first iteration of your tests start.
   */
  async beforeStartIteration(runner) {
    if (this.options.injectJs) {
      await this.browsertimeBidi.injectJavaScript(this.options.injectJs);
    }

    if (this.options.basicAuth) {
      await this.browsertimeBidi.setBasicAuth(this.options.basicAuth);
    }

    if (this.options.requestheader) {
      await this.browsertimeBidi.setRequestHeaders(this.options.requestheader);
      if (this.options.block) {
        await this.browsertimeBidi.blockUrls(this.options.block);
      }

      if (
        this.firefoxConfig.appendToUserAgent ||
        this.options.appendToUserAgent
      ) {
        const currentUserAgent = await runner.runScript(
          'return navigator.userAgent;',
          'GET_USER_AGENT'
        );
        let script = `Services.prefs.setStringPref('general.useragent.override', '${currentUserAgent} ${
          this.firefoxConfig.appendToUserAgent || this.options.appendToUserAgent
        }');`;
        return runner.runPrivilegedScript(script, 'SET_USER_AGENT');
      }
    }
  }

  /**
   * Before each URL/test runs.
   */
  async beforeEachURL(runner, url) {
    await runner.runPrivilegedScript(`
      new Promise(async function(resolve) {
        await Services.fog.testFlushAllChildren(); // force any data that wasn't recorded yet to be immediately put in the buffers
        Services.fog.testResetFOG(); // empty the buffers
        resolve();
      });
    `);

    if (!this.skipHar) {
      await this.har.startRecording();
    }

    if (isAndroidConfigured(this.options)) {
      if (this.options.androidPower) {
        await this.android.resetPowerUsage();
      } else if (this.options.androidUsbPower) {
        const usbPowerProfiler = await loadUsbPowerProfiler();
        if (usbPowerProfiler) {
          await usbPowerProfiler.resetPowerData();
        }
      }
    }

    if (
      this.firefoxConfig.geckoProfiler &&
      this.firefoxConfig.geckoProfilerRecordingType !== 'custom'
    ) {
      this.geckoProfiler = new GeckoProfiler(
        runner,
        this.storageManager,
        this.options
      );

      await this.geckoProfiler.start();
    }

    if (this.options.cookie && url) {
      await this.browsertimeBidi.setCookie(url, this.options.cookie);
    } else if (this.options.cookie) {
      log.info('Could not set cookie because the URL is unknown');
    }

    if (this.firefoxConfig.perfStats) {
      this.perfStats = new PerfStats(runner, this.firefoxConfig);
      return this.perfStats.start();
    }

    this.testStartTime = Date.now();
  }

  /**
   * When the page has finsihed loading, this functions runs (before
   * collecting metrics etc). This is the place to get you HAR file,
   * stop trace logging, stop measuring etc.
   *
   */
  async afterPageCompleteCheck(runner, index, url, alias) {
    const result = { url, alias };

    if (isAndroidConfigured(this.options)) {
      if (this.options.androidPower) {
        result.power = await this.android.measurePowerUsage(
          this.firefoxConfig.android.package
        );
      } else if (this.options.androidUsbPower) {
        result.power = await this.android.measureUsbPowerUsage(
          this.testStartTime,
          Date.now()
        );

        await this.android.getUsbPowerUsageProfile(
          index,
          url,
          result,
          this.options,
          this.storageManager
        );
      }
    }

    if (
      this.firefoxConfig.geckoProfiler &&
      this.firefoxConfig.geckoProfilerRecordingType !== 'custom'
    ) {
      await this.geckoProfiler.stop(index, url, result);
    }

    if (this.firefoxConfig.perfStats) {
      result.perfStats = await this.perfStats.collect();
      await this.perfStats.stop();
    }

    if (this.firefoxConfig.memoryReport) {
      const memoryReport = new MemoryReport(
        runner,
        this.storageManager,
        this.firefoxConfig,
        this.options
      );
      result.memory = await memoryReport.collect(index, url);
    }

    const useFirefoxAppConstants = getProperty(
      this.options || {},
      'firefox.appconstants',
      false
    );

    if (useFirefoxAppConstants === true) {
      const appConstantsScript = `const { AppConstants } = ChromeUtils.import(
      'resource://gre/modules/AppConstants.jsm'
    );
    return AppConstants;`;

      this.appConstants = await runner.runPrivilegedScript(
        appConstantsScript,
        'APP_CONSTANTS'
      );
    }

    let powerusage = await runner.runPrivilegedScript(`
      return new Promise(async function(resolve) {
        Services.fog.initializeFOG(); // prevents timeout when collecting CPU metrics
        await Services.fog.testFlushAllChildren(); // force data from child processes to be sent to the parent.
        resolve(Glean.power.totalCpuTimeMs.testGetValue());
      });
    `);
    if (powerusage) {
      log.info('CPU / Power usage: ' + powerusage);
    }
    result.cpu = powerusage;

    if (this.skipHar) {
      if (result.alias && !this.aliasAndUrl[result.alias]) {
        this.aliasAndUrl[result.alias] = result.url;
      }
      return result;
    } else {
      const har = await this.har.stopRecording();
      if (har.log.pages.length > 0) {
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
      return result;
    }
  }

  /**
   * The URL/test is finished, all metrics are collected.
   */
  async afterEachURL(runner, index, result) {
    if (this.appConstants) {
      result.browserScripts.browser.appConstants = this.appConstants;
    }

    result.googleWebVitals = {};
    if (
      result.browserScripts.timings &&
      result.browserScripts.timings.largestContentfulPaint
    ) {
      result.googleWebVitals.largestContentfulPaint =
        result.browserScripts.timings.largestContentfulPaint.renderTime ||
        result.browserScripts.timings.largestContentfulPaint.loadTime;
    }

    if (
      result.browserScripts.timings &&
      result.browserScripts.timings.paintTiming &&
      result.browserScripts.timings.paintTiming['first-contentful-paint']
    ) {
      result.googleWebVitals.firstContentfulPaint =
        result.browserScripts.timings.paintTiming['first-contentful-paint'];
    }
  }

  async postWork(index, results) {
    for (const result of results) {
      if (this.firefoxConfig.collectMozLog) {
        const files = await findFiles(this.baseDir, 'moz_log.txt');
        for (const file of files) {
          await rename(
            `${this.baseDir}/${file}`,
            path.join(
              this.baseDir,
              pathToFolder(result.url, this.options),
              `${file}-${index}.txt`
            )
          );
        }
      }

      if (this.firefoxConfig.geckoProfiler && this.options.visualMetrics) {
        const profileFilename = this.options.enableProfileRun
          ? `geckoProfile-${index}-extra.json.gz`
          : `geckoProfile-${index}.json.gz`;
        const profileSubdir = pathToFolder(result.url, this.options);

        try {
          const geckoProfile = JSON.parse(
            await this.storageManager.readData(profileFilename, profileSubdir)
          );
          if (!geckoProfile.meta) {
            geckoProfile.meta = {};
          }

          // Here we are calculating the unix timestamp of the first frame after orange screen
          // by adding the time to first frame, time to orange screen to the unix timestamp of
          // video recording start time
          const firstFrameStartTime =
            result.recordingStartTime +
            result.videoRecordingStart +
            result.timeToFirstFrame;

          for (let progress of [
            'VisualProgress',
            'ContentfulSpeedIndexProgress',
            'PerceptualSpeedIndexProgress'
          ]) {
            // You can configure to not use content and perceptual.
            if (result.visualMetrics[progress]) {
              result.visualMetrics[progress] = adjustVisualProgressTimestamps(
                result.visualMetrics[progress],
                geckoProfile.meta.startTime,
                firstFrameStartTime
              );
            }
          }
          geckoProfile.meta.visualMetrics = result.visualMetrics;

          await this.storageManager.writeJson(
            path.join(
              profileSubdir,
              this.options.enableProfileRun
                ? `geckoProfile-${index}-extra.json.gz`
                : `geckoProfile-${index}.json`
            ),
            geckoProfile,
            true
          );
        } catch (error) {
          log.error(
            `Could not rewrite visual progress using startimes and add visual metrics to ${profileFilename}`,
            error
          );
        }
      }
    }
  }

  /**
   * This method is called if a runs fail
   */
  failing(url) {
    if (this.skipHar) {
      return;
    }
    this.hars.push(getEmptyHAR(url, 'Firefox'));
  }

  /**
   * Get the HAR file for all the runs.
   */
  async getHARs() {
    return !this.skipHar && this.hars.length > 0
      ? { har: mergeHars(this.hars) }
      : {};
  }
  /**
   * Before the browser is stopped/closed.
   */
  async beforeBrowserStop() {
    if (isAndroidConfigured(this.options)) {
      if (this.options.androidPower) {
        await this.android.stopPowerTesting();
      } else if (this.options.androidUsbPower) {
        const usbPowerProfiler = await loadUsbPowerProfiler();
        if (usbPowerProfiler) {
          await usbPowerProfiler.stopSampling();
        }
      }
    }
  }

  /**
   * Before the browser is stopped/closed.
   */
  async afterBrowserStopped() {}

  async waitForNetworkIdle(driver) {
    const windowId = await driver.getWindowHandle();
    const bidi = await driver.getBidi();
    let network = new NetworkManager(bidi, [windowId], this.options);
    return network.waitForNetworkIdle();
  }
}
