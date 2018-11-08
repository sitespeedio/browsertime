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
const {
  createAndroidConnection,
  isAndroidConfigured
} = require('../../android');

const delay = ms => new Promise(res => setTimeout(res, ms));

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
      this.preScripts = engineUtils.loadPrePostScripts(options.preScript);
      this.postScripts = engineUtils.loadPrePostScripts(options.postScript);
      this.navigationScript = engineUtils.loadScript(options.scriptNavigation);
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
    this.myVideo = new Video(storageManager, options);
  }

  /**
   *  Run one iteration for one url. Here are the whole flow of what we
   * do for one URL per iteration.
   * @param {*} url - The URL that will be tested
   * @param {*} index - Which iteration it is
   */
  async run(url, index) {
    const options = this.options;
    const browser = new SeleniumRunner(
      this.storageManager.directory,
      this.options
    );
    const extensionServer = this.extensionServer;
    const recordVideo = this.recordVideo;
    const combine = options.videoParams.combine;
    const engineDelegate = this.engineDelegate;
    const pageCompleteCheck = this.pageCompleteCheck;
    const video = this.myVideo;
    // The data we push to all pre/post tasks
    const taskOptions = {
      url,
      options,
      log,
      storageManager: this.storageManager,
      taskData: {},
      index,
      webdriver,
      runWithDriver: function(driverScript) {
        return browser.runWithDriver(driverScript);
      }
    };

    // Have a concistent way of starting the video
    const startVideo = async function start() {
      await setOrangeBackground(browser.getDriver(), options);
      await video.record();
      // Give ffmpeg/video on phone time to settle
      if (isAndroidConfigured(options)) {
        return delay(1000);
      } else {
        return delay(400);
      }
    };

    // The helpers are functions that you can use in your own
    // navigation script.
    const helpers = {
      start: async function() {
        await engineDelegate.onStartIteration(browser, index);
        if (recordVideo) {
          await startVideo();
          const navigate = `(function() {
              const orange = document.getElementById('browsertime-orange');
              if (orange) {
                orange.parentNode.removeChild(orange);
              }
            })();`;
          await browser.getDriver().executeScript(navigate);
        }
        result.timestamp = engineUtils.timestamp();
      },
      navigate: async function(url) {
        return browser.loadAndWait(url, pageCompleteCheck);
      },
      startAndNavigate: async function(url) {
        await engineDelegate.onStartIteration(browser, index);
        if (recordVideo && !combine) {
          await startVideo();
        }
        result.timestamp = engineUtils.timestamp();
        return browser.loadAndWait(url, pageCompleteCheck);
      }
      /* This is for coming support of multiple pages
      // You want to new things: Start a measuring a new page
      // and that means setting the color to orange
      new: async function() {
        return setOrangeBackground(browser.getDriver(), options);
      },
      // And we also want to automatically collect metrics. 
      // For that to work we need to do a couple of changes and that
      // probably come in next major release
      newPage: async function(url) {
        // TODO we need to colllect metrics
        // Take screenshots etc
        await setOrangeBackground(browser.getDriver(),options);
        await delay(500);
        // TODO we need to reset HAR collections etc
        return browser.loadAndWait(url, this.pageCompleteCheck);
        */
    };
    const result = {
      extraJson: {}
    };

    if (recordVideo) {
      await video.setupDirs(index);
    }

    log.info('Testing url %s iteration %s', url, index);
    try {
      await browser.start();
      await setResourceTimingBufferSize(browser.getDriver(), 600);
      await extensionServer.setupExtension(url, browser);

      // On slowish Android phones it takes some time for the
      // browser to get ready
      if (isAndroidConfigured(options)) {
        await delay(1000);
      }
      if (recordVideo && combine) {
        await video.record();
      }
      for (const preScript of this.preScripts) {
        await preScript.run(taskOptions);
      }
      if (options.preURL) {
        await preURL(browser, options);
      }

      if (!options.scriptNavigation) {
        await helpers.startAndNavigate(url);
      } else {
        await this.navigationScript.run(taskOptions, helpers);
        // We have an extra wait here to be sure ...
        await browser.wait(pageCompleteCheck);
      }

      // And stop the video when the URL is finished
      if (recordVideo && !combine) {
        await video.stop();
      }

      // Collect all the metrics through JavaScript
      const syncScripts = this.scriptsByCategory
          ? await browser.runScripts(this.scriptsByCategory)
          : {},
        asyncScripts = this.asyncScriptsByCategory
          ? await browser.runScripts(this.asyncScriptsByCategory, true)
          : {};

      result.browserScripts = merge({}, syncScripts, asyncScripts);

      // Some sites has crazy amount of user timings:
      // strip them if you want
      if (options.userTimingWhitelist) {
        filterWhitelisted(
          result.browserScripts.timings.userTimings,
          options.userTimingWhitelist
        );
      }

      if (options.screenshot) {
        try {
          result.screenshot = await browser.takeScreenshot();
        } catch (e) {
          // not getting screenshots shouldn't result in a failed test.
          log.warning(e);
        }
      }

      if (options.chrome && options.chrome.collectConsoleLog) {
        result.extraJson[`console-${index}.json`] = await browser.getLogs(
          webdriver.logging.Type.BROWSER
        );
      }

      if (isAndroidConfigured(options) && options.chrome.collectNetLog) {
        const android = createAndroidConnection(options);
        await android.initConnection();
        await android.pullNetLog(
          `${this.storageManager.directory}/chromeNetlog-${index}.json`
        );
      }

      await this.engineDelegate.onStopIteration(browser, index, result);

      for (const postScript of this.postScripts) {
        taskOptions.results = result;
        await postScript.run(taskOptions);
      }

      if (recordVideo && combine) {
        await video.stop();
      }

      // maybe we should close the browser before? hmm
      if (recordVideo) {
        await video.postProcessing(result);
      }
      return result;
    } catch (e) {
      log.error(e);
      // Take a screenshot in error case for verbose > 1
      if (options.verbose >= 1) {
        try {
          let pngData = await browser.takeScreenshot();
          await this.storageManager.writeData(
            'error_screen_for_run_' + index + '.png',
            pngData
          );
        } catch (e) {
          // not getting or soring screenshots shouldn't result in a failed test.
          log.warning(e);
        }
      }
      // In Docker on Desktop we can use a hardcore way to cleanup
      if (options.docker && recordVideo && !isAndroidConfigured(options)) {
        await stop('ffmpeg');
      }
      result.error = [e.name];
      return result;
    } finally {
      // Here we should also make sure FFMPEG is really killed/stopped
      // if something fails, we had bug reports where we miss it
      await browser.stop();
    }
  }
}

module.exports = Iteration;
