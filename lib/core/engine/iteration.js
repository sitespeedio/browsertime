import { platform } from 'node:os';
import webdriver from 'selenium-webdriver';
import intel from 'intel';

import { SeleniumRunner } from '../seleniumRunner.js';
import { preURL } from '../../support/preURL.js';
import { setResourceTimingBufferSize } from '../../support/setResourceTimingBufferSize.js';
import { ScreenshotManager } from '../../screenshot/index.js';
import { ExtensionServer } from '../../extensionserver/index.js';
import { Video } from '../../video/video.js';
import { stop } from '../../support/stop.js';
import { AddText } from './command/addText.js';
import { Click } from './command/click.js';
import { Wait } from './command/wait.js';
import { Measure } from './command/measure.js';
import { JavaScript } from './command/javaScript.js';
import { Switch } from './command/switch.js';
import { Screenshot } from './command/screenshot.js';
import { Set } from './command/set.js';
import { Cache } from './command/cache.js';
import { Meta } from './command/meta.js';
import { Watch as StopWatch } from './command/stopWatch.js';
import { Select } from './command/select.js';
import { Debug } from './command/debug.js';
import { AndroidCommand } from './command/android.js';
import { ChromeDevelopmentToolsProtocol } from './command/chromeDevToolsProtocol.js';
import {
  addConnectivity,
  removeConnectivity
} from '../../connectivity/index.js';
import { jsonifyVisualProgress } from '../../support/util.js';
import { flushDNS } from '../../support/dns.js';
import {
  SingleClick,
  DoubleClick,
  ClickAndHold,
  ContextClick,
  MouseMove
} from './command/mouse/index.js';
import { getNumberOfRunningProcesses } from '../../support/processes.js';
import { isAndroidConfigured, Android } from '../../android/index.js';
import { Scroll } from './command/scroll.js';
import { Navigation } from './command/navigation.js';
import { GeckoProfiler } from '../../firefox/geckoProfiler.js';
const log = intel.getLogger('browsertime');
const delay = ms => new Promise(res => setTimeout(res, ms));

// Make this configurable
const ANDROID_DELAY_TIME = 2000;
/**
 * Create a new Iteration instance. This is the iteration flow, what
 * Browsertime will do through one iteration of testing a URL.
 * @class
 */
export class Iteration {
  constructor(
    storageManager,
    engineDelegate,
    scriptsByCategory,
    asyncScriptsByCategory,
    preScripts,
    postScripts,
    postURLScripts,
    pageCompleteCheck,
    options
  ) {
    this.preScripts = preScripts;
    this.postScripts = postScripts;
    this.postURLScripts = postURLScripts;
    this.pageCompleteCheck = pageCompleteCheck;
    this.options = options;
    this.storageManager = storageManager;
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
    if (platform() === 'darwin' || platform() === 'linux') {
      this.processesAtStart = Number(await getNumberOfRunningProcesses());
    }
    const screenshotManager = new ScreenshotManager(
      this.storageManager,
      this.options
    );
    const options = this.options;
    const browser = new SeleniumRunner(
      this.storageManager.directory,
      this.options
    );
    this.video = new Video(this.storageManager, this.options, browser);
    const recordVideo = options.visualMetrics || options.video;
    const videos = [];
    const result = [];
    const batteryTemperature = {};

    const extensionServer = new ExtensionServer(options);
    const engineDelegate = this.engineDelegate;

    try {
      if (options.flushDNS) {
        await flushDNS(options);
      }
      if (options.connectivity && options.connectivity.variance) {
        await addConnectivity(options);
      }

      await engineDelegate.beforeBrowserStart();
      await browser.start();
      await engineDelegate.afterBrowserStart();

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
        engineDelegate,
        extensionServer,
        this.storageManager,
        videos,
        this.scriptsByCategory,
        this.asyncScriptsByCategory,
        this.postURLScripts,
        context,
        screenshotManager,
        options
      );

      let profiler = {};
      if (options.browser === 'firefox') {
        if (options.firefox.geckoProfilerCustom) {
          const browserProfiler = new GeckoProfiler(
            browser,
            this.storageManager,
            this.options.firefox,
            this.options
          );

          profiler.start = () => browserProfiler.start();
          profiler.stop = () => browserProfiler.stop();
        }
      } else {
        profiler.start = undefined;
        profiler.stop = undefined;
      } // Extend to chrome trace

      const cdp = new ChromeDevelopmentToolsProtocol(
        engineDelegate,
        options.browser
      );
      const android = new Android(options);
      const debug = new Debug(browser, options);
      const commands = {
        profiler: profiler,
        click: new Click(browser, this.pageCompleteCheck),
        scroll: new Scroll(browser, options),
        addText: new AddText(browser),
        wait: new Wait(browser, this.pageCompleteCheck),
        measure: measure,
        navigate: measure._navigate.bind(measure),
        navigation: new Navigation(browser, this.pageCompleteCheck),
        error: measure._error.bind(measure),
        markAsFailure: measure._failure.bind(measure),
        js: new JavaScript(browser, this.pageCompleteCheck),
        switch: new Switch(
          browser,
          this.pageCompleteCheck,
          measure._navigate.bind(measure)
        ),
        set: new Set(browser),
        stopWatch: new StopWatch(measure),
        cache: new Cache(browser, options.browser, extensionServer, cdp),
        meta: new Meta(),
        screenshot: new Screenshot(screenshotManager, browser, index),
        cdp,
        android: new AndroidCommand(options),
        debug: debug,
        mouse: {
          moveTo: new MouseMove(browser),
          contextClick: new ContextClick(browser),
          singleClick: new SingleClick(browser, this.pageCompleteCheck),
          doubleClick: new DoubleClick(browser, this.pageCompleteCheck),
          clickAndHold: new ClickAndHold(browser)
        },
        select: new Select(browser)
      };

      // Safari can't load data:text URLs at startup, so you can either choose
      // your own URL or use the blank one
      const startURL =
        options.safari && options.safari.startURL
          ? options.safari.startURL
          : 'data:text/html;charset=utf-8,<html><body></body></html>';
      if (options.spa) {
        await setResourceTimingBufferSize(startURL, browser.getDriver(), 1000);
      } else if (!options.processStartTime) {
        // Before we needed Chrome to open once to get correct values for Chrome HAR
        // but now Firefox first visual change is slower if we remove this ...
        await browser.getDriver().get(startURL);
      }

      // On slowish Android phones it takes some time for the
      // browser to get ready
      if (isAndroidConfigured(options)) {
        await delay(ANDROID_DELAY_TIME);
        batteryTemperature.start = await android.getTemperature();
      }

      await delay(options.timeToSettle || 100);

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
      } catch (error) {
        commands.error(error.message);
        commands.markAsFailure(error.message);
        throw error;
      }
      if (commands.measure.areWeMeasuring === true) {
        // someone forgot to call stop();
        log.info(
          'It looks like you missed to call measure.stop() after calling measure.start(..) (without using a URL). Checkout https://www.sitespeed.io/documentation/sitespeed.io/scripting/#measurestartalias'
        );
        await commands.measure.stop();
      }

      for (const postScript of this.postScripts) {
        await postScript(context, commands);
      }

      if (recordVideo && options.videoParams.debug) {
        // Just use the first URL
        const url =
          result.length > 0 ? result[0].url : 'https://debug.sitespeed.io';
        await this.video.stop(url);
      }

      await engineDelegate.beforeBrowserStop(browser, index, result);

      // if we are in debig mode we wait on a continue command
      if (options.debug) {
        await debug.breakpoint('End-of-iteration');
      }

      if (options.browser === 'firefox' && options.debug) {
        log.info('Firefox is kept open in debug mode');
      } else {
        if (isAndroidConfigured(options) && options.ignoreShutdownFailures) {
          try {
            log.info('Ignoring shutdown failures on android...');
            await browser.stop();
          } catch {
            // Ignore shutdown failures on android
            log.info('Shutdown problem hit, ignoring...');
          }
        } else {
          await browser.stop();
        }
      }
      // Give the browsers some time to stop
      await delay(2000);
      await engineDelegate.afterBrowserStopped();

      if (isAndroidConfigured(options)) {
        batteryTemperature.stop = await android.getTemperature();
        await android.removeDevtoolsFw();
      }

      if (options.visualMetrics && !options.videoParams.debug) {
        let index_ = 0;
        for (let myVideo of videos) {
          try {
            const videoMetrics = await myVideo.postProcessing(
              result[index_].browserScripts.timings.pageTimings,
              result[index_].browserScripts.pageinfo.visualElements
            );

            for (let progress of [
              'VisualProgress',
              'ContentfulSpeedIndexProgress',
              'PerceptualSpeedIndexProgress'
            ]) {
              if (videoMetrics.visualMetrics[progress]) {
                videoMetrics.visualMetrics[progress] = jsonifyVisualProgress(
                  videoMetrics.visualMetrics[progress]
                );
              }
            }
            result[index_].videoRecordingStart =
              videoMetrics.videoRecordingStart;
            result[index_].visualMetrics = videoMetrics.visualMetrics;
            index_++;
          } catch (error) {
            // If one of the Visual Metrics runs fail, try the next one
            log.error('Visual Metrics failed to analyse the video', error);
            if (result[index_]) {
              result[index_].error.push(error.message);
            }
          }
        }
      }

      result.screenshots = screenshotManager.getSaved();

      if (engineDelegate.postWork) {
        await engineDelegate.postWork(index, result);
      }

      if (isAndroidConfigured(options)) {
        result.batteryTemperature = batteryTemperature;
      }

      if (commands.meta.description) {
        result.description = commands.meta.description;
      }
      if (commands.meta.title) {
        result.title = commands.meta.title;
      }

      result.processesAtStart = this.processesAtStart;
      return result;
    } catch (error) {
      log.error(error);
      if (recordVideo && options.videoParams.debug) {
        // Just use the first URL
        const url =
          result.length > 0 ? result[0].url : 'https://debug.sitespeed.io';
        await this.video.stop(url);
      }

      // In Docker on Desktop we can use a hardcore way to cleanup
      if (options.docker && recordVideo && !isAndroidConfigured(options)) {
        await stop('ffmpeg');
      }
      result.error = [error.name];
      result.markedAsFailure = 1;
      result.failureMessages = [error.message];
      return result;
    } finally {
      // Here we should also make sure FFMPEG is really killed/stopped
      // if something fails, we had bug reports where we miss it
      try {
        if (options.connectivity.variance) {
          await removeConnectivity(options);
        }
        if (options.browser === 'firefox' && options.debug) {
          log.info('Firefox is kept open in debug mode');
        } else {
          await browser.stop();
        }
      } catch {
        // Most cases the browser been stopped already
      }
    }
  }
}
