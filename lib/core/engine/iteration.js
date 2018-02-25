'use strict';
const Promise = require('bluebird');
const webdriver = require('selenium-webdriver');
const log = require('intel');
const merge = require('lodash.merge');
const get = require('lodash.get');
const SeleniumRunner = require('../seleniumRunner');
const pullNetLogAndroid = require('../../support/pullNetLogAndroid');
const preURL = require('../../support/preURL');
const filterWhitelisted = require('../../support/userTiming').filterWhitelisted;
const { BrowserError } = require('../../support/errors');
const engineUtils = require('../../support/engineUtils');
const Video = require('./video');

/**
 * Create a new Iteration instance. This is the iteration flow, what
 * Browsertime will do through one iteration of testing a URL.
 * @class
 */
class Iteration {
  constructor(
    url,
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
    this.url = url;
    this.extensionServer = extensionServer;
    this.recordVideo = options.speedIndex || options.video;
    this.engineDelegate = engineDelegate;
    this.scriptsByCategory = scriptsByCategory;
    this.asyncScriptsByCategory = asyncScriptsByCategory;
    this.myVideo = new Video(options);
  }

  run(index) {
    const url = this.url;
    const options = this.options;
    const browser = new SeleniumRunner(this.options);
    const extensionServer = this.extensionServer;
    const recordVideo = this.recordVideo;
    const combine = options.videoParams.combine;
    const video = this.myVideo;
    const testOnAndroid = get(options, 'chrome.android.package', false);
    // The data we push to all pre/post tasks lookalikes
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

    // we need to get rid off this HACK
    this.options.index = index;

    const result = {
      extraJson: {}
    };

    log.info('Testing url %s iteration %s', url, index + 1);
    return browser
      .start()
      .then(() => extensionServer.setupExtension(taskOptions))
      .then(() => {
        // If we combine the video we want to record the full
        // flow making it easier to debug
        if (recordVideo && combine) {
          return video.record(taskOptions);
        } else return Promise.resolve();
      })
      .then(() =>
        // Run all the pre scripts
        Promise.mapSeries(this.preScripts, preScript =>
          preScript.run(taskOptions)
        )
      )
      .then(() => {
        // Access the preURL
        if (options.preURL) {
          return preURL.run(taskOptions);
        } else return Promise.resolve();
      })
      .then(() => this.engineDelegate.onStartIteration(browser, index))
      .then(() => {
        result.timestamp = engineUtils.timestamp();
      })
      .then(() => {
        // By default start the video just before we start to
        // load the URL we wanna test
        if (recordVideo && !combine) {
          return video.record(taskOptions);
        } else return Promise.resolve();
      })
      .then(() => browser.loadAndWait(url, options.pageCompleteCheck))
      .then(() => {
        // And stop the video when the URL is finished
        if (recordVideo && !combine) {
          return video.stop(taskOptions);
        } else return Promise.resolve();
      })
      .then(() => {
        // Collect all the metrics through JavaScript
        const syncScripts = browser.runScripts(this.scriptsByCategory),
          asyncScripts = browser.runScripts(this.asyncScriptsByCategory, true);

        return Promise.join(
          syncScripts,
          asyncScripts,
          (syncScripts, asyncScripts) => merge({}, syncScripts, asyncScripts)
        ).then(browserScripts => {
          result.browserScripts = browserScripts;
        });
      })
      .then(() => {
        // Some sites has crazy amount of user timings:
        // strip them if you want
        if (options.userTimingWhitelist) {
          filterWhitelisted(
            result.browserScripts.timings.userTimings,
            options.userTimingWhitelist
          );
        }
      })
      .then(() => {
        // We should use sharp here so we can save the image
        // to jpeg. We can port what we have in sitespeed.io
        if (options.screenshot) {
          return browser
            .takeScreenshot()
            .tap(pngData => (result.screenshot = pngData))
            .catch(BrowserError, e => {
              // not getting screenshots shouldn't result in a failed test.
              log.warning(e);
            });
        } else return Promise.resolve();
      })
      .then(() => {
        if (options.chrome && options.chrome.collectConsoleLog) {
          return browser
            .getLogs(webdriver.logging.Type.BROWSER)
            .tap(
              browserLog =>
                (result.extraJson[`console-${index}.json`] = browserLog)
            );
        }
      })
      .then(() => {
        if (testOnAndroid && options.chrome.collectNetLog) {
          return pullNetLogAndroid(taskOptions);
        } else return Promise.resolve();
      })
      .then(() => this.engineDelegate.onStopIteration(browser, index, result))
      .then(() =>
        // Run all the post scripts
        Promise.mapSeries(this.postScripts, postScript => {
          taskOptions.results = result;
          return postScript.run(taskOptions);
        })
      )
      .then(() => {
        if (recordVideo && combine) {
          return video.stop(taskOptions);
        } else return Promise.resolve();
      })
      .then(() => {
        // maybe we should close the browser before? hmm
        if (recordVideo) {
          taskOptions.results = result;
          return Promise.mapSeries(video.postProcessVideo(), steps =>
            steps.run(taskOptions)
          );
        } else return Promise.resolve();
      })
      .then(() => result)
      .finally(() => {
        // Here we should also make sure FFMPEG is really killed/stopped
        // if something fails, we had bug reports where we miss it
        return browser.stop();
      });
  }
}

module.exports = Iteration;
