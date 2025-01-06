import { platform } from 'node:os';
import webdriver from 'selenium-webdriver';
import { getLogger } from '@sitespeed.io/log';

import { Context } from './context.js';
import { Commands } from './commands.js';
import { SeleniumRunner } from '../seleniumRunner.js';
import { preURL } from '../../support/preURL.js';
import { setResourceTimingBufferSize } from '../../support/setResourceTimingBufferSize.js';
import { ScreenshotManager } from '../../screenshot/index.js';
import { Video } from '../../video/video.js';
import { stop } from '../../support/stop.js';

import {
  addConnectivity,
  removeConnectivity
} from '../../connectivity/index.js';
import {
  jsonifyVisualProgress,
  jsonifyKeyColorFrames
} from '../../support/util.js';
import { flushDNS } from '../../support/dns.js';

import { getNumberOfRunningProcesses } from '../../support/processes.js';
import { isAndroidConfigured, Android } from '../../android/index.js';
const log = getLogger('browsertime');
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
      await engineDelegate.afterBrowserStart(browser);

      // The data we push to all selenium scripts
      const context = new Context(
        options,
        result,
        log,
        this.storageManager,
        index,
        webdriver,
        browser.getDriver()
      );

      const commands = new Commands(
        browser,
        engineDelegate,
        index,
        result,
        this.storageManager,
        this.pageCompleteCheck,
        context,
        videos,
        screenshotManager,
        this.scriptsByCategory,
        this.asyncScriptsByCategory,
        this.postURLScripts,
        options
      );

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
        this.android = new Android(options);
        batteryTemperature.start = await this.android.getTemperature();
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
        await commands.debug.breakpoint('End-of-iteration');
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
        batteryTemperature.stop = await this.android.getTemperature();
        await this.android.removeDevtoolsFw();
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
            if (videoMetrics.visualMetrics['KeyColorFrames']) {
              videoMetrics.visualMetrics['KeyColorFrames'] =
                jsonifyKeyColorFrames(
                  videoMetrics.visualMetrics['KeyColorFrames']
                );
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
