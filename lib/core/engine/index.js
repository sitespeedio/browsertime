'use strict';

const Promise = require('bluebird');
const log = require('intel');
const merge = require('lodash.merge');
const StorageManager = require('../../support/storageManager');
const FirefoxDelegate = require('../../firefox/webdriver/firefoxDelegate');
const ChromeDelegate = require('../../chrome/webdriver/chromeDelegate');
const { UrlLoadError } = require('../../support/errors');
const connectivity = require('../../connectivity/');
const util = require('../../support/util');
const engineUtils = require('../../support/engineUtils');
const harUtil = require('../../support/har/');
const XVFB = require('../../support/xvfb');
const ExtensionServer = require('../../extensionserver/');
const Collector = require('./collector');
const Iteration = require('./iteration');

const defaults = {
  scripts: [],
  iterations: 3,
  delay: 0,
  videoParams: {}
};

const delay = ms => new Promise(res => setTimeout(res, ms));

function shouldDelay(index, total, delay) {
  const isLast = total - index <= 1;
  return delay > 0 && !isLast;
}

function addExtraFieldsToHar(totalResult, options) {
  for (let index = 0; index < totalResult.har.log.pages.length; index++) {
    const page = totalResult.har.log.pages[index];
    const visualMetric = totalResult.visualMetrics[index];
    const browserScript = totalResult.browserScripts[index] || {};
    const cpu = totalResult.cpu[index] || {};
    harUtil.addExtrasToHAR(
      page,
      visualMetric,
      browserScript.timings,
      cpu,
      options
    );
  }
}
/**
 * Create a new Browsertime Engine.
 * @class
 */
class Engine {
  constructor(options) {
    this.options = merge({}, defaults, options);
    this.myXVFB = new XVFB(this.options);
    this.myExtensionServer = new ExtensionServer(this.options);
    this.options.viewPort = engineUtils.calculateViewport(this.options);
    this.engineDelegate =
      options.browser === 'firefox'
        ? new FirefoxDelegate(options)
        : new ChromeDelegate(options);
  }

  /**
   * Start the engine. Will prepare everything before you will start your run:
   * * Start XVFB (if it is configured)
   * * Set connectivity
   * * Start the extension server
   */
  start() {
    return Promise.all([
      this.myXVFB.start(),
      connectivity.set(this.options),
      this.myExtensionServer.start()
    ]);
  }

  /**
   * Run the engine and test a URL and collect metrics with the scripts.
   * @param {string} url - the URL that will be tested
   * @param {*} scriptsByCategory - hmm promises, I think we should change this
   * @param {*} asyncScriptsByCategory - hmm promises, I think we should change this
   */
  async run(url, scriptsByCategory, asyncScriptsByCategory) {
    const options = this.options;
    const storageManager = new StorageManager(url, options);
    const engineDelegate = this.engineDelegate;
    const collector = new Collector(url, storageManager, options);
    const iteration = new Iteration(
      storageManager,
      this.myExtensionServer,
      engineDelegate,
      scriptsByCategory,
      asyncScriptsByCategory,
      options
    );

    // FIXME We shouldn't alter options
    options.baseDir = await storageManager.createDataDir();
    try {
      await engineDelegate.onStartRun(url, options);

      for (let index = 0; index < options.iterations; index++) {
        const data = await iteration.run(url, index);
        await collector.perIteration(data, index);
        if (shouldDelay(index, options.iterations, options.delay)) {
          await delay(options.delay);
        }
      }

      const totalResult = collector.getResults();
      await engineDelegate.onStopRun(totalResult);
      // Add extra fields to the HAR
      // to make the HAR files better when we use them in
      // compare.sitespeed.io
      if (totalResult.har) {
        addExtraFieldsToHar(totalResult, options);
      }
      log.info(util.getResultLogLine(totalResult));
      return totalResult;
    } catch (e) {
      if (e instanceof Promise.TimeoutError) {
        throw new UrlLoadError(
          'Failed to load ' + url + ', cause: ' + e.message,
          url,
          {
            cause: e
          }
        );
      } else throw e;
    }
  }

  /**
   * Stop the engine. Will stop everything started in start().
   * * Stop XVFB (if it is configured)
   * * Remove connectivity
   * * Stop the extension server
   */
  stop() {
    return Promise.all([
      this.myXVFB.stop(),
      connectivity.remove(this.options),
      this.myExtensionServer.stop()
    ]);
  }
}

module.exports = Engine;
