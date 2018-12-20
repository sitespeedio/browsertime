'use strict';

const webdriver = require('selenium-webdriver');
const log = require('intel').getLogger('browsertime');
const merge = require('lodash.merge');
const SeleniumRunner = require('../seleniumRunner');
const preURL = require('../../support/preURL');
const setResourceTimingBufferSize = require('../../support/setResourceTimingBufferSize');
const filterWhitelisted = require('../../support/userTiming').filterWhitelisted;
const engineUtils = require('../../support/engineUtils');
const Video = require('../../video/video');
const setOrangeBackground = require('../../video/screenRecording/setOrangeBackground');
const stop = require('../../support/stop');
const ScreenshotManager = require('../../screenshot/');

const { isAndroidConfigured } = require('../../android');

const delay = ms => new Promise(res => setTimeout(res, ms));

function getNewResult(url) {
  return {
    extraJson: {},
    timestamp: engineUtils.timestamp(),
    url
  };
}
// Make this configurable
const ANDROID_DELAY_TIME = 2000;
/**
 * Create a new Iteration instance. This is the iteration flow, what
 * Browsertime will do through one iteration of testing a URL.
 * @class
 */
class Iteration {
  constructor(
    storageManager,
    extensionServer,
    engineDelegate,
    scriptsByCategory,
    asyncScriptsByCategory,
    options
  ) {
    try {
      this.pageCompleteCheck = engineUtils.loadScript(
        options.pageCompleteCheck
      );
    } catch (e) {
      log.error(e.message);
      throw e;
    }
    this.options = options;
    this.storageManager = storageManager;
    this.extensionServer = extensionServer;
    this.recordVideo = options.visualMetrics || options.video;
    this.engineDelegate = engineDelegate;
    this.scriptsByCategory = scriptsByCategory;
    this.asyncScriptsByCategory = asyncScriptsByCategory;
    this.screenshotManager = new ScreenshotManager(storageManager, options);
  }

  /**
   *  Run one iteration for one url. Here are the whole flow of what we
   * do for one URL per iteration.
   * @param {*} url - The URL that will be tested
   * @param {*} index - Which iteration it is
   */
  async run(navigationScript, index) {
    const options = this.options;
    const browser = new SeleniumRunner(
      this.storageManager.directory,
      this.options
    );
    const extensionServer = this.extensionServer;
    const storageManager = this.storageManager;
    const recordVideo = this.recordVideo;
    const engineDelegate = this.engineDelegate;
    const pageCompleteCheck = this.pageCompleteCheck;
    // const video = this.myVideo;
    const scriptsByCategory = this.scriptsByCategory;
    const asyncScriptsByCategory = this.asyncScriptsByCategory;
    const screenshotManager = this.screenshotManager;
    const videos = [];
    let video;

    // Have a concistent way of starting the video
    const startVideo = async function(url, noPages, index) {
      video = new Video(storageManager, options);
      await setOrangeBackground(browser.getDriver(), options);
      await video.record(url, noPages, index);
      // Give ffmpeg/video on phone time to settle
      if (isAndroidConfigured(options)) {
        return delay(ANDROID_DELAY_TIME);
      } else {
        return delay(400);
      }
    };

    const result = [];
    // Keep track of how many pages we collect
    let noPages = 0;

    // The helpers are functions that you can use in your own
    // navigation script.
    const helpers = {
      startMeasure: async function(url) {
        if (!url) {
          log.error('You need to supply a URL to the startMeasure function');
        }
        log.verbose('Start to measure');
        await engineDelegate.onStartIteration(browser, index);
        if (recordVideo) {
          await startVideo(url, noPages, index);
          const navigate = `(function() {
              const orange = document.getElementById('browsertime-orange');
              if (orange) {
                orange.parentNode.removeChild(orange);
              }
            })();`;
          await browser.getDriver().executeScript(navigate);
        }
        result.push(getNewResult(url));
        result[noPages].timestamp = engineUtils.timestamp();
      },
      collect: async function() {
        log.verbose('Collecting metrics');

        if (recordVideo) {
          await video.stop();
          videos.push(video);
        }
        // Collect all the metrics through JavaScript
        const syncScripts = scriptsByCategory
            ? await browser.runScripts(scriptsByCategory)
            : {},
          asyncScripts = asyncScriptsByCategory
            ? await browser.runScripts(asyncScriptsByCategory, true)
            : {};

        result[noPages].browserScripts = merge({}, syncScripts, asyncScripts);
        // Some sites has crazy amount of user timings:
        // strip them if you want
        if (options.userTimingWhitelist) {
          filterWhitelisted(
            result[noPages].browserScripts.timings.userTimings,
            options.userTimingWhitelist
          );
        }

        if (options.screenshot) {
          try {
            const screenshot = await browser.takeScreenshot();
            await screenshotManager.save(
              `${index}`,
              screenshot,
              result[noPages].url
            );
          } catch (e) {
            // not getting screenshots shouldn't result in a failed test.
            log.warning(e);
          }
        }

        await engineDelegate.onCollect(browser, index, result, noPages + 1);
        noPages++;
      },
      stopMeasure: async function() {
        log.verbose('Stop measuring');
        return this.collect();
      },
      measure: async function(url) {
        log.info('Testing url %s iteration %s', url, index);
        // On the first page of an iteration, do what you need to do!
        if (noPages === 0) {
          await extensionServer.setupExtension(url, browser);
          await engineDelegate.onStartIteration(browser, index);
        }
        result.push(getNewResult(url));
        result[noPages].timestamp = engineUtils.timestamp();
        if (recordVideo) {
          await startVideo(url, noPages, index);
        }
        await engineDelegate.clear(browser);

        await browser.loadAndWait(url, pageCompleteCheck);
        return this.collect();
      },
      navigate: async function(url) {
        log.info('Navigating to url %s iteration %s', url, index);
        if (noPages === 0) {
          await extensionServer.setupExtension(url, browser);
        }
        return browser.loadAndWait(url, pageCompleteCheck);
      }
    };

    try {
      await browser.start();

      // The data we push to all selenium scripts
      const context = {
        options,
        log,
        storageManager: this.storageManager,
        taskData: {},
        index,
        webdriver, // The Selenium WebDriver public API object https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index.html
        driver: browser.getDriver(), // The instantiated version of the WebDriver https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html
        h: helpers
      };

      await setResourceTimingBufferSize(browser.getDriver(), 600);

      // On slowish Android phones it takes some time for the
      // browser to get ready
      if (isAndroidConfigured(options)) {
        await delay(ANDROID_DELAY_TIME);
      }

      if (options.preURL) {
        await preURL(browser, options);
      }

      await navigationScript(context);
      await this.engineDelegate.onStopIteration(browser, index, result);
      await browser.stop();

      if (recordVideo) {
        let i = 0;
        for (let myVideo of videos) {
          const videoMetrics = await myVideo.postProcessing(
            result[i].browserScripts.timings.pageTimings,
            result[i].browserScripts.pageinfo.visualElements
          );
          result[i].visualMetrics = videoMetrics.visualMetrics;
          i++;
        }
      }
      return result;
    } catch (e) {
      log.error(e);
      // In Docker on Desktop we can use a hardcore way to cleanup
      if (options.docker && recordVideo && !isAndroidConfigured(options)) {
        await stop('ffmpeg');
      }
      result.error = [e.name];
      return result;
    } finally {
      // Here we should also make sure FFMPEG is really killed/stopped
      // if something fails, we had bug reports where we miss it
      try {
        await browser.stop();
      } catch (e) {
        // Most cases the browser been stopped already
      }
    }
  }
}

module.exports = Iteration;
