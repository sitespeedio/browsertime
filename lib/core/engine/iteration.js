'use strict';

const webdriver = require('selenium-webdriver');
const log = require('intel').getLogger('browsertime');
const SeleniumRunner = require('../seleniumRunner');
const preURL = require('../../support/preURL');
const setResourceTimingBufferSize = require('../../support/setResourceTimingBufferSize');
const engineUtils = require('../../support/engineUtils');
const Video = require('../../video/video');
const stop = require('../../support/stop');
const AddText = require('./command/addText.js');
const Click = require('./command/click.js');
const Wait = require('./command/wait.js');
const Measure = require('./command/measure.js');
const JavaScript = require('./command/javaScript.js');
const Switch = require('./command/switch.js');
const Set = require('./command/set.js');
const Cache = require('./command/cache.js');
const Meta = require('./command/meta.js');
const ChromeDevToolsProtocol = require('./command/chromeDevToolsProtocol.js');
const { addConnectivity, removeConnectivity } = require('../../connectivity');

const { isAndroidConfigured } = require('../../android');

const delay = ms => new Promise(res => setTimeout(res, ms));

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
      this.preScripts = engineUtils.loadPrePostScripts(options.preScript);
      this.postScripts = engineUtils.loadPrePostScripts(options.postScript);
      this.postURLScripts = engineUtils.loadPrePostScripts(
        options.postURLScript
      );
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
    this.engineDelegate = engineDelegate;
    this.scriptsByCategory = scriptsByCategory;
    this.asyncScriptsByCategory = asyncScriptsByCategory;
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
    this.video = new Video(this.storageManager, this.options, browser);
    const recordVideo = options.visualMetrics || options.video;
    const videos = [];
    const result = [];

    try {
      if (options.connectivity.variance) {
        await addConnectivity(options);
      }
      await browser.start();
      await this.engineDelegate.afterBrowserStart();

      // The data we push to all selenium scripts
      const context = {
        // TODO we want to have the URL here so we can use scripts to login
        // and then access the supplied URL
        options,
        result,
        log,
        storageManager: this.storageManager,
        taskData: {},
        index,
        selenium: {
          webdriver, // The Selenium WebDriver public API object https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index.html
          driver: browser.getDriver() // The instantiated version of the WebDriver https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html
        }
      };

      const measure = new Measure(
        browser,
        index,
        this.pageCompleteCheck,
        result,
        this.engineDelegate,
        this.extensionServer,
        this.storageManager,
        videos,
        this.scriptsByCategory,
        this.asyncScriptsByCategory,
        this.postURLScripts,
        context,
        options
      );

      const cdp = new ChromeDevToolsProtocol(
        this.engineDelegate,
        options.browser
      );
      const commands = {
        click: new Click(browser, this.pageCompleteCheck),
        addText: new AddText(browser),
        wait: new Wait(browser),
        measure: measure,
        navigate: measure._navigate.bind(measure),
        error: measure._error.bind(measure),
        js: new JavaScript(browser, this.pageCompleteCheck),
        switch: new Switch(browser),
        set: new Set(browser),
        cache: new Cache(options.browser, this.extensionServer, cdp),
        meta: new Meta(),
        cdp
      };

      if (options.spa) {
        await setResourceTimingBufferSize(browser.getDriver(), 1000);
      } else {
        // Before we needed Chrome to open once to get correct values for Chrome HAR
        // but now Firefox first visual change is slower if we remove this ...
        await browser
          .getDriver()
          .get('data:text/html;charset=utf-8,<html><body></body></html>');
      }

      // On slowish Android phones it takes some time for the
      // browser to get ready
      if (isAndroidConfigured(options)) {
        await delay(ANDROID_DELAY_TIME);
      }

      if (recordVideo && options.videoParams.debug) {
        await this.video.record(0, index);
      }

      for (const preScript of this.preScripts) {
        await preScript(context, commands);
      }

      if (options.preURL) {
        await preURL(browser, options);
      }

      try {
        await navigationScript(context, commands, this.postURLScripts);
      } catch (e) {
        commands.error(e.message);
        throw e;
      }
      if (commands.measure.areWeMeasuring === true) {
        // someone forgot to call stop();
        log.info(
          'It looks like you missed to call measure.stop() after calling measure.start(..) (without using a URL). Checkout https://www.sitespeed.io/documentation/sitespeed.io/scripting/#measurestartalias'
        );
        await commands.measure.stop();
      }
      await this.engineDelegate.onStopIteration(browser, index, result);

      for (const postScript of this.postScripts) {
        await postScript(context, commands);
      }

      if (recordVideo && options.videoParams.debug) {
        // Just use the first URL
        const url = result[0].url;
        await this.video.stop(url);
      }
      await browser.stop();

      if (options.visualMetrics && !options.videoParams.debug) {
        let i = 0;
        for (let myVideo of videos) {
          try {
            const videoMetrics = await myVideo.postProcessing(
              result[i].browserScripts.timings.pageTimings,
              result[i].browserScripts.pageinfo.visualElements
            );
            result[i].visualMetrics = videoMetrics.visualMetrics;
            i++;
          } catch (e) {
            // If one of the Visual Metrics runs fail, just swallow and try the next one
            log.error('Visual Metrics failed to analyse the video', e);
          }
        }
      }
      if (commands.meta.description) {
        result.description = commands.meta.description;
      }
      if (commands.meta.title) {
        result.title = commands.meta.title;
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
        if (options.connectivity.variance) {
          await removeConnectivity(options);
        }
        await browser.stop();
      } catch (e) {
        // Most cases the browser been stopped already
      }
    }
  }
}

module.exports = Iteration;
