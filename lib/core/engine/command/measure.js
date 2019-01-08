'use strict';

const log = require('intel').getLogger('browsertime.command.measure');
const ScreenshotManager = require('../../../screenshot/');
const engineUtils = require('../../../support/engineUtils');
const Video = require('../../../video/video');
const merge = require('lodash.merge');
const setOrangeBackground = require('../../../video/screenRecording/setOrangeBackground');
const delay = ms => new Promise(res => setTimeout(res, ms));
const filterWhitelisted = require('../../../support/userTiming')
  .filterWhitelisted;
const { isAndroidConfigured } = require('../../../android');

// Make this configurable
const ANDROID_DELAY_TIME = 2000;

function getNewResult() {
  return {
    extraJson: {},
    timestamp: engineUtils.timestamp()
  };
}

class Measure {
  constructor(
    browser,
    index,
    pageCompleteCheck,
    result,
    engineDelegate,
    extensionServer,
    storageManager,
    videos,
    scriptsByCategory,
    asyncScriptsByCategory,
    options
  ) {
    this.browser = browser;
    this.pageCompleteCheck = pageCompleteCheck;
    this.index = index;
    this.result = result;
    this.engineDelegate = engineDelegate;
    this.options = options;
    this.screenshotManager = new ScreenshotManager(storageManager, options);
    this.storageManager = storageManager;
    this.recordVideo = options.visualMetrics || options.video;
    this.extensionServer = extensionServer;
    this.videos = videos;
    this.scriptsByCategory = scriptsByCategory;
    this.asyncScriptsByCategory = asyncScriptsByCategory;
    this.noPages = 0;
  }

  // Have a concistent way of starting the video
  async _startVideo(noPages, index) {
    this.video = new Video(this.storageManager, this.options);
    await setOrangeBackground(this.browser.getDriver(), this.options);
    await this.video.record(noPages, index);
    // Give ffmpeg/video on phone time to settle
    if (isAndroidConfigured(this.options)) {
      return delay(ANDROID_DELAY_TIME);
    } else {
      return delay(400);
    }
  }

  async _navigate(url) {
    log.info('Navigating to url %s iteration %s', url, this.index);
    if (this.noPages === 0) {
      await this.extensionServer.setupExtension(url, this.browser);
    }
    return this.browser.loadAndWait(url, this.pageCompleteCheck);
  }

  /**u
   *  Start collecting metrics for a URL. If you supply a URL to this method, the browser will navigate to that URL.
   *  If you do not use an URL (start()) everything is prepared for a new page to measure except the browser do not
   *  navigate to a new URL.
   * @param {string} url
   * @returns {Promise} Promise object represents when the URL has been navigated and finished loading according to the pageCompleteCheck or when everything is setup for measuring a new URL (if no URL is supplied).
   */
  async start(url) {
    if (url) {
      log.info('Testing url %s iteration %s', url, this.index);
    } else {
      log.info('Start to measure');
    }
    // On the first page of an iteration, do what you need to do!
    if (this.noPages === 0 && url) {
      await this.extensionServer.setupExtension(url, this.browser);
      await this.engineDelegate.onStartIteration(this.browser, this.index);
    }
    this.result.push(getNewResult());
    this.result[this.noPages].timestamp = engineUtils.timestamp();

    if (this.recordVideo) {
      await this._startVideo(this.noPages, this.index);
      const navigate = `(function() {
          const orange = document.getElementById('browsertime-orange');
          if (orange) {
            orange.parentNode.removeChild(orange);
          }
        })();`;
      await this.browser.getDriver().executeScript(navigate);
    }

    if (this.options.spa) {
      // Make sure that the resource timing is empty
      await this.browser
        .getDriver()
        .executeScript('window.performance.clearResourceTimings();');
    }

    if (url) {
      await this.engineDelegate.clear(this.browser);
      await this.browser.loadAndWait(url, this.pageCompleteCheck);
      return this.collect();
    } else {
      return this.engineDelegate.clear(this.browser);
    }
  }

  /**
   * Stop measuring and collect all the metrics.
   * @returns {Promise} Promise object represents all the metrics has been collected.
   */
  async stop() {
    log.verbose('Stop measuring');
    return this.collect();
  }

  async collect() {
    log.verbose('Collecting metrics');
    // Collect all the metrics through JavaScript
    const syncScripts = this.scriptsByCategory
        ? await this.browser.runScripts(this.scriptsByCategory)
        : {},
      asyncScripts = this.asyncScriptsByCategory
        ? await this.browser.runScripts(this.asyncScriptsByCategory, true)
        : {};

    this.result[this.noPages].browserScripts = merge(
      {},
      syncScripts,
      asyncScripts
    );

    // when we have the URL we can use that to stop the video and put it where we want it
    if (this.recordVideo) {
      const url = this.result[this.noPages].browserScripts.pageinfo.url;
      await this.video.stop(url);
      this.videos.push(this.video);
    }
    // Some sites has crazy amount of user timings:
    // strip them if you want
    if (this.options.userTimingWhitelist) {
      filterWhitelisted(
        this.result[this.noPages].browserScripts.timings.userTimings,
        this.options.userTimingWhitelist
      );
    }

    if (this.options.screenshot) {
      try {
        const screenshot = await this.browser.takeScreenshot();
        await this.screenshotManager.save(
          `${this.index}`,
          screenshot,
          this.result[this.noPages].url
        );
      } catch (e) {
        // not getting screenshots shouldn't result in a failed test.
        log.warning(e);
      }
    }

    await this.engineDelegate.onCollect(
      this.browser,
      this.index,
      this.result,
      this.noPages + 1
    );
    this.noPages++;
  }
}

module.exports = Measure;
