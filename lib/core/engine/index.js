'use strict';

const log = require('intel').getLogger('browsertime');
const merge = require('lodash.merge');
const getPort = require('get-port');
const StorageManager = require('../../support/storageManager');
const FirefoxDelegate = require('../../firefox/webdriver/firefoxDelegate');
const ChromeDelegate = require('../../chrome/webdriver/chromeDelegate');
const { addConnectivity, removeConnectivity } = require('../../connectivity');
const util = require('../../support/util');
const harUtil = require('../../support/har/');
const XVFB = require('../../support/xvfb');
const ExtensionServer = require('../../extensionserver/');
const Iteration = require('./iteration');
const Collector = require('./collector');
const run = require('./run');
const engineUtils = require('../../support/engineUtils');

const defaults = {
  scripts: [],
  iterations: 3,
  delay: 0,
  videoParams: {}
};

const delay = ms => new Promise(res => setTimeout(res, ms));

function shouldDelay(index, total, delay) {
  const isLast = total - index === 0;
  return delay > 0 && !isLast;
}

function addExtraFieldsToHar(totalResults, har, options) {
  if (har) {
    let harPageNumber = 0;
    // We test one page
    // Let's do a better fix for this later on
    // right now this fixes https://github.com/sitespeedio/browsertime/issues/754
    if (har.log.pages.length === options.iterations) {
      for (let harPage of har.log.pages) {
        let pageNumber = harPageNumber % totalResults.length;
        const visualMetric =
          totalResults[pageNumber].visualMetrics[harPageNumber];
        const browserScript =
          totalResults[pageNumber].browserScripts[harPageNumber];
        const cpu = totalResults[pageNumber].cpu[harPageNumber];

        harUtil.addMetaToHAR(
          harPageNumber,
          harPage,
          totalResults[pageNumber].info.url,
          options
        );

        if (browserScript) {
          harUtil.addTimingsToHAR(
            harPage,
            visualMetric,
            browserScript.timings,
            cpu
          );
        }
        harPageNumber++;
      }
    } else {
      const numberOfPages = totalResults.length;
      for (let page = 0; page < numberOfPages; page++) {
        for (let iteration = 0; iteration < options.iterations; iteration++) {
          let harIndex = iteration * totalResults.length;
          harIndex += page;

          const visualMetric = totalResults[page].visualMetrics[iteration];
          const browserScript = totalResults[page].browserScripts[iteration];
          const cpu = totalResults[page].cpu[iteration];

          harUtil.addMetaToHAR(
            iteration,
            har.log.pages[harIndex],
            totalResults[page].info.url,
            options
          );
          // Only add the metrics if we was able to collect the metrics and have a HAR
          if (browserScript && har.log.pages[harIndex]) {
            harUtil.addTimingsToHAR(
              har.log.pages[harIndex],
              visualMetric,
              browserScript.timings,
              cpu
            );
          }
        }
      }
    }
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
    this.myExtensionServer = new ExtensionServer();
  }

  /**
   * Start the engine. Will prepare everything before you will start your run:
   * * Start XVFB (if it is configured)
   * * Set connectivity
   * * Start the extension server
   */
  async start() {
    this.options.devToolsPort = await getPort({
      port: getPort.makeRange(9222, 9350),
      host: '127.0.0.1'
    });
    return Promise.all([
      this.myXVFB.start(),
      addConnectivity(this.options),
      this.myExtensionServer.start()
    ]);
  }

  async runByScript(
    navigationScript,
    name,
    scriptsByCategory,
    asyncScriptsByCategory
  ) {
    const options = this.options;
    const storageManager = new StorageManager(name, options);
    const engineDelegate =
      this.options.browser === 'firefox'
        ? new FirefoxDelegate(storageManager.directory, this.options)
        : new ChromeDelegate(storageManager, this.options);
    const iteration = new Iteration(
      storageManager,
      this.myExtensionServer,
      engineDelegate,
      scriptsByCategory,
      asyncScriptsByCategory,
      options
    );

    await storageManager.createDataDir();
    await engineDelegate.onStart(name, options);
    const collector = new Collector(name, storageManager, options);

    log.info(
      'Running tests using %s - %s iteration(s)',
      `${options.browser[0].toUpperCase()}${options.browser.slice(1)}`,
      options.iterations
    );

    for (let index = 1; index < options.iterations + 1; index++) {
      const data = await iteration.run(navigationScript, index);
      // Only collect if it was succesful
      // Here we got room for improvements
      if (data && data[0] && data[0].url) {
        await collector.perIteration(data, index);
      } else {
        log.error('No data to collect');
      }
      if (shouldDelay(index, options.iterations, options.delay)) {
        await delay(options.delay);
      }
    }

    const extras = await engineDelegate.onStop();

    // Backfill the fully loaded data that we extract from the HAR
    if (extras.har) {
      const fullyLoadedPerUrl = harUtil.getFullyLoaded(extras.har);
      for (let data of fullyLoadedPerUrl) {
        collector.addFullyLoaded(data.url, data.fullyLoaded);
      }
    }

    const totalResult = collector.getResults();
    // Add extra fields to the HAR
    // to make the HAR files better when we use them in
    // compare.sitespeed.io
    if (extras.har) {
      addExtraFieldsToHar(totalResult, extras.har, options);
      totalResult.har = extras.har;
    }
    util.logResultLogLine(totalResult);
    return totalResult;
  }

  async run(url, scriptsByCategory, asyncScriptsByCategory) {
    return this.runByScript(
      run([url]),
      url,
      scriptsByCategory,
      asyncScriptsByCategory
    );
  }

  async runMultiple(urlOrFiles, scriptsByCategory, asyncScriptsByCategory) {
    const scripts = [];
    let name;
    for (let urlOrFile of urlOrFiles) {
      if (urlOrFile.indexOf('http') > -1) {
        scripts.push(urlOrFile);
      } else {
        scripts.push(engineUtils.loadScript(urlOrFile, true));
      }
      if (!name) {
        name = urlOrFile;
      }
    }
    return this.runByScript(
      run(scripts),
      name,
      scriptsByCategory,
      asyncScriptsByCategory
    );
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
