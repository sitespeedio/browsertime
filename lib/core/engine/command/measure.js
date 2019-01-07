'use strict';

const log = require('intel').getLogger('browsertime.measure');
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

function getNewResult(url) {
  return {
    extraJson: {},
    timestamp: engineUtils.timestamp(),
    url
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
  async _startVideo(url, noPages, index) {
    this.video = new Video(this.storageManager, this.options);
    await setOrangeBackground(this.browser.getDriver(), this.options);
    await this.video.record(url, noPages, index);
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

  async startAndNavigate(url) {
    log.info('Testing url %s iteration %s', url, this.index);
    // On the first page of an iteration, do what you need to do!
    if (this.noPages === 0) {
      await this.extensionServer.setupExtension(url, this.browser);
      await this.engineDelegate.onStartIteration(this.browser, this.index);
    }
    this.result.push(getNewResult(url));
    this.result[this.noPages].timestamp = engineUtils.timestamp();
    if (this.recordVideo) {
      await this._startVideo(url, this.noPages, this.index);
    }
    await this.engineDelegate.clear(this.browser);

    await this.browser.loadAndWait(url, this.pageCompleteCheck);
    return this.collect();
  }

  async start(url) {
    if (!url) {
      log.error('You need to supply a URL to the startMeasure function');
    }
    log.verbose('Start to measure');
    await this.engineDelegate.onStartIteration(this.browser, this.index);
    if (this.recordVideo) {
      await this._startVideo(url, this.noPages, this.index);
      const navigate = `(function() {
          const orange = document.getElementById('browsertime-orange');
          if (orange) {
            orange.parentNode.removeChild(orange);
          }
        })();`;
      await this.browser.getDriver().executeScript(navigate);
    }
    this.result.push(getNewResult(url));
    this.result[this.noPages].timestamp = engineUtils.timestamp();
  }

  async stop() {
    log.verbose('Stop measuring');
    return this.collect();
  }

  async collect() {
    log.verbose('Collecting metrics');

    if (this.recordVideo) {
      await this.video.stop();
      this.videos.push(this.video);
    }
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
