'use strict';

const Promise = require('bluebird');
const log = require('intel');
const merge = require('lodash.merge');
const get = require('lodash.get');
const version = require('../../../package').version;
const Statistics = require('../../support/statistics').Statistics;
const StorageManager = require('../../support/storageManager');
const engineDelegate = require('../engineDelegate');
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

function shouldDelay(index, total, delay) {
  const isLast = total - index <= 1;
  return delay > 0 && !isLast;
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
    this.engineDelegate = engineDelegate.createDelegate(this.options);
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
  run(url, scriptsByCategory, asyncScriptsByCategory) {
    const options = this.options;
    const storageManager = new StorageManager(url, options);
    const iterations = new Array(options.iterations);
    const engineDelegate = this.engineDelegate;
    const statistics = new Statistics();
    const collector = new Collector(statistics, storageManager, options);
    const iteration = new Iteration(
      url,
      storageManager,
      this.myExtensionServer,
      engineDelegate,
      scriptsByCategory,
      asyncScriptsByCategory,
      options
    );

    // Put all the result from the iterations here
    const result = {
      info: {
        browsertime: {
          version
        },
        url,
        timestamp: engineUtils.timestamp(),
        connectivity: {
          engine: get(this.options, 'connectivity.engine'),
          profile: get(this.options, 'connectivity.profile')
        }
      },
      timestamps: [],
      browserScripts: [],
      visualMetrics: [],
      cpu: []
    };

    return storageManager
      .createDataDir()
      .then(baseDir => (options.baseDir = baseDir))
      .then(() => engineDelegate.onStartRun(url, options))
      .then(() =>
        Promise.reduce(
          iterations,
          (totalResult, item, index, totalIterations) => {
            let promise = iteration
              .run(index)
              .then(data =>
                collector
                  .perIteration(data, totalResult, index)
                  .then(() => totalResult)
              );
            if (shouldDelay(index, totalIterations, options.delay)) {
              promise = promise.delay(options.delay);
            }
            return promise;
          },
          result
        )
      )
      .then(() => engineDelegate.onStopRun(result))
      .then(() => {
        // add the options metrics we want
        result.statistics = statistics.summarizeDeep(options);
      })
      .then(() => {
        // Add extra fields to the HAR
        // to make the HAR files better when we use them in
        // compare.sitespeed.io
        if (result.har) {
          const numPages = result.har.log.pages.length;
          if (numPages !== options.iterations) {
            log.error(
              `Number of HAR pages (${numPages}) does not match number of iterations (${
                options.iterations
              })`
            );
            return;
          }

          for (let index = 0; index < numPages; index++) {
            const page = result.har.log.pages[index];
            const visualMetric = result.visualMetrics[index];
            const browserScript = result.browserScripts[index] || {};
            const cpu = result.cpu[index] || {};
            harUtil.addExtrasToHAR(
              page,
              visualMetric,
              browserScript.timings,
              cpu,
              options
            );
          }
        }
      })
      .then(() => {
        log.info(util.getResultLogLine(result));
        return result;
      })
      .catch(Promise.TimeoutError, e => {
        throw new UrlLoadError(
          'Failed to load ' + url + ', cause: ' + e.message,
          url,
          {
            cause: e
          }
        );
      });
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
