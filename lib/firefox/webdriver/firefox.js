import { rename as _rename } from 'node:fs';
import { promisify } from 'node:util';
import { join } from 'node:path';
import intel from 'intel';
import get from 'lodash.get';
import { getEmptyHAR, mergeHars } from '../../support/har/index.js';
import pathToFolder from '../../support/pathToFolder.js';
import { isAndroidConfigured, Android } from '../../android/index.js';
import { adjustVisualProgressTimestamps } from '../../support/util.js';
import { findFiles } from '../../support/fileUtil.js';
import getHAR from '../getHAR.js';
import GeckoProfiler from '../geckoProfiler.js';
import { MemoryReport } from '../memoryReport.js';
import { PerfStats } from '../perfStats.js';
const log = intel.getLogger('browsertime.firefox');
const rename = promisify(_rename);
class Firefox {
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
  async afterBrowserStart() {}

  /**
   * Before the first iteration of your tests start.
   */
  async beforeStartIteration(runner) {
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

  /**
   * Before each URL/test runs.
   */
  async beforeEachURL(runner) {
    if (isAndroidConfigured(this.options) && this.options.androidPower) {
      await this.android.resetPowerUsage();
    }

    if (this.firefoxConfig.geckoProfiler) {
      this.geckoProfiler = new GeckoProfiler(
        runner,
        this.storageManager,
        this.firefoxConfig,
        this.options
      );

      await this.geckoProfiler.start();
    }

    if (this.firefoxConfig.perfStats) {
      this.perfStats = new PerfStats(runner, this.firefoxConfig);
      return this.perfStats.start();
    }
  }

  /**
   * When the page has finsihed loading, this functions runs (before
   * collecting metrics etc). This is the place to get you HAR file,
   * stop trace logging, stop measuring etc.
   *
   */
  async afterPageCompleteCheck(runner, index, url, alias) {
    const result = { url, alias };

    if (isAndroidConfigured(this.options) && this.options.androidPower) {
      result.power = await this.android.measurePowerUsage(
        this.firefoxConfig.android.package
      );
    }

    if (this.firefoxConfig.geckoProfiler) {
      await this.geckoProfiler.stop(index, url);
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

    const useFirefoxAppConstants = get(
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

    if (this.skipHar || isAndroidConfigured(this.options)) {
      return result;
    } else {
      const har = await getHAR(runner, this.includeResponseBodies);
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
  }

  async postWork(index, results) {
    for (const result of results) {
      if (this.firefoxConfig.collectMozLog) {
        const files = await findFiles(this.baseDir, 'moz_log.txt');
        for (const file of files) {
          await rename(
            `${this.baseDir}/${file}`,
            join(
              this.baseDir,
              pathToFolder(result.url, this.options),
              `${file}-${index}.txt`
            )
          );
        }
      }

      if (this.firefoxConfig.geckoProfiler && this.options.visualMetrics) {
        const profileFilename = `geckoProfile-${index}.json.gz`;
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
            join(profileSubdir, `geckoProfile-${index}.json`),
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
    if (isAndroidConfigured(this.options) && this.options.androidPower) {
      await this.android.stopPowerTesting();
    }
  }

  /**
   * Before the browser is stopped/closed.
   */
  async afterBrowserStopped() {}
}

export default Firefox;
