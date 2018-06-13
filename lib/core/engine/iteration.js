'use strict';

const webdriver = require('selenium-webdriver');
const log = require('intel');
const merge = require('lodash.merge');
const SeleniumRunner = require('../seleniumRunner');
const preURL = require('../../support/preURL');
const setResourceTimingBufferSize = require('../../support/setResourceTimingBufferSize');
const filterWhitelisted = require('../../support/userTiming').filterWhitelisted;
const engineUtils = require('../../support/engineUtils');
const Video = require('../../video/video');
const setOrangeBackground = require('../../video/screenRecording/setOrangeBackground');
const setWindowTitle = require('../../video/screenRecording/setWindowTitle');
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
      // By default start the video just before we start to
      // load the URL we wanna test
      if (recordVideo && !combine) {
        await setOrangeBackground(browser.getDriver());
        if (process.platform === 'win32') {
          await setWindowTitle(browser.getDriver());
        }
        await video.record();
        // Give ffmpeg/video on phone time to settle
        if (isAndroidConfigured(options)) {
          await delay(1000);
        } else {
          await delay(400);
        }
      }
      await this.engineDelegate.onStartIteration(browser, index);
      result.timestamp = engineUtils.timestamp();
      await browser.loadAndWait(url, options.pageCompleteCheck);

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
      // In docker we can use a hardcore way to cleanup
      if (options.docker) {
        if (recordVideo) {
          await stop('ffmpeg');
        }
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
