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
    this.numberOfMeasuredPages = 0;
    this.numberOfVisitedPages = 0;
  }

  // Have a concistent way of starting the video
  async _startVideo(numberOfMeasuredPages, index) {
    this.video = new Video(this.storageManager, this.options);
    await setOrangeBackground(this.browser.getDriver(), this.options);
    await this.video.record(numberOfMeasuredPages, index);
    // Give ffmpeg/video on phone time to settle
    if (isAndroidConfigured(this.options)) {
      return delay(ANDROID_DELAY_TIME);
    } else {
      return delay(400);
    }
  }

  async _navigate(url) {
    log.info('Navigating to url %s iteration %s', url, this.index);
    if (this.numberOfVisitedPages === 0) {
      await this.extensionServer.setupExtension(url, this.browser);
    }
    this.numberOfVisitedPages++;
    return this.browser.loadAndWait(url, this.pageCompleteCheck);
  }

  /**u
   *  Start collecting metrics for a URL. If you supply a URL to this method, the browser will navigate to that URL.
   *  If you do not use an URL (start()) everything is prepared for a new page to measure except the browser do not
   *  navigate to a new URL. You can also add an alias for the URL.
   * @param {string} urlOrAlias
   * @param {string} optionalAlias
   * @returns {Promise} Promise object represents when the URL has been navigated and finished loading according to the pageCompleteCheck or when everything is setup for measuring a new URL (if no URL is supplied).
   */
  async start(urlOrAlias, optionalAlias) {
    let url, alias;
    if (
      urlOrAlias &&
      (urlOrAlias.startsWith('http') || urlOrAlias.startsWith('data:text'))
    ) {
      url = urlOrAlias;
      log.info('Testing url %s iteration %s', url, this.index);
    } else if (urlOrAlias) {
      alias = urlOrAlias;
      log.info('Start to measure %s', alias);
    } else {
      log.info('Start to measure');
    }
    // On the first page of an iteration, do what you need to do!
    if (this.numberOfVisitedPages === 0 && url) {
      await this.extensionServer.setupExtension(url, this.browser);
      await this.engineDelegate.onStartIteration(this.browser, this.index);
    }
    this.result.push(getNewResult());
    this.result[this.numberOfMeasuredPages].timestamp = engineUtils.timestamp();

    if (alias || optionalAlias) {
      this.result[this.numberOfMeasuredPages].alias = alias || optionalAlias;
    }

    if (this.options.spa) {
      // Make sure that the resource timing is empty
      await this.browser
        .getDriver()
        .executeScript('window.performance.clearResourceTimings();');
    }

    if (this.recordVideo && !this.options.videoParams.debug) {
      await this._startVideo(this.numberOfMeasuredPages, this.index);
      // if we do not have the URL, we should remove the orange and
      // start meausuring because the user themself will navigate to
      // the URL that will be tested.
      if (!url) {
        const removeOrange = `(function() {
          const orange = document.getElementById('browsertime-orange');
          if (orange) {
            orange.parentNode.removeChild(orange);
          }
        })();`;
        await this.browser.getDriver().executeScript(removeOrange);
      }
    }

    if (url) {
      // if we test a URL make sure everything is cleared before we start
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

    const url = await this.browser.runScript('return document.URL', 'PAGE_URL');

    this.result[this.numberOfMeasuredPages].url = url;

    const syncScripts = this.scriptsByCategory
        ? await this.browser.runScripts(this.scriptsByCategory)
        : {},
      asyncScripts = this.asyncScriptsByCategory
        ? await this.browser.runScripts(this.asyncScriptsByCategory, true)
        : {};

    this.result[this.numberOfMeasuredPages].browserScripts = merge(
      {},
      syncScripts,
      asyncScripts
    );

    // when we have the URL we can use that to stop the video and put it where we want it
    if (this.recordVideo && !this.options.videoParams.debug) {
      await this.video.stop(url);
      this.videos.push(this.video);
    }
    // Some sites has crazy amount of user timings:
    // strip them if you want
    if (this.options.userTimingWhitelist) {
      filterWhitelisted(
        this.result[this.numberOfMeasuredPages].browserScripts.timings
          .userTimings,
        this.options.userTimingWhitelist
      );
    }

    if (this.options.screenshot) {
      try {
        const screenshot = await this.browser.takeScreenshot();
        await this.screenshotManager.save(`${this.index}`, screenshot, url);
      } catch (e) {
        // not getting screenshots shouldn't result in a failed test.
        log.warning(e);
      }
    }

    await this.engineDelegate.onCollect(
      this.browser,
      this.index,
      this.result[this.numberOfMeasuredPages]
    );
    this.numberOfMeasuredPages++;
    this.numberOfVisitedPages++;
  }
}

module.exports = Measure;
