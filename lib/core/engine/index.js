'use strict';

const log = require('intel').getLogger('browsertime');
const merge = require('lodash.merge');
const StorageManager = require('../../support/storageManager');
const FirefoxDelegate = require('../../firefox/webdriver/firefoxDelegate');
const ChromeDelegate = require('../../chrome/webdriver/chromeDelegate');
const { addConnectivity, removeConnectivity } = require('../../connectivity');
const util = require('../../support/util');
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
      index,
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
    if (log.isEnabledFor(log.DEBUG)) {
      log.debug('Running with options: %:2j', this.options);
    }
    this.myXVFB = new XVFB(this.options);
    this.myExtensionServer = new ExtensionServer(this.options);
  }

  /**
   * Start the engine. Will prepare everything before you will start your run:
   * * Start XVFB (if it is configured)
   * * Set connectivity
   * * Start the extension server
   */
  async start() {
    return Promise.all([
      this.myXVFB.start(),
      addConnectivity(this.options),
      this.myExtensionServer.start()
    ]);
  }

  /**
   * Run the engine and test a URL and collect metrics with the scripts.
   * @param {string} url - the URL that will be tested
   * @param {*} scriptsByCategory
   * @param {*} asyncScriptsByCategory
   */
  async run(url, scriptsByCategory, asyncScriptsByCategory) {
    const options = this.options;
    const storageManager = new StorageManager(url, options);
    const engineDelegate =
      this.options.browser === 'firefox'
        ? new FirefoxDelegate(storageManager.directory, this.options)
        : new ChromeDelegate(storageManager.directory, this.options);
    const collector = new Collector(url, storageManager, options);
    const iteration = new Iteration(
      storageManager,
      this.myExtensionServer,
      engineDelegate,
      scriptsByCategory,
      asyncScriptsByCategory,
      options
    );

    await storageManager.createDataDir();
    await engineDelegate.onStart(url, options);

    for (let index = 1; index < options.iterations + 1; index++) {
      const data = await iteration.run(url, index);
      await collector.perIteration(data, index);
      if (shouldDelay(index, options.iterations, options.delay)) {
        await delay(options.delay);
      }
    }

    const totalResult = collector.getResults();
    await engineDelegate.onStop(totalResult);
    // Add extra fields to the HAR
    // to make the HAR files better when we use them in
    // compare.sitespeed.io
    if (totalResult.har) {
      addExtraFieldsToHar(totalResult, options);
    }
    log.info(util.getResultLogLine(totalResult));
    return totalResult;
  }

  /**
   * Stop the engine. Will stop everything started in start().
   * * Stop XVFB (if it is configured)
   * * Remove connectivity
   * * Stop the extension server
   */
  async stop() {
    return Promise.all([
      this.myXVFB.stop(),
      removeConnectivity(this.options),
      this.myExtensionServer.stop()
    ]);
  }
}

module.exports = Engine;
