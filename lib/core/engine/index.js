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
const connectivity = require('../../support/connectivity');
const util = require('../../support/util');
const engineUtils = require('../../support/engineUtils');
const XVFB = require('./xvfb');
const ExtensionServer = require('./extensionServer');
const Collect = require('./collect');
const Iteration = require('./iteration');

const defaults = {
  scripts: [],
  iterations: 3,
  delay: 0,
  videoParams: {}
};

function shouldDelay(runIndex, totalRuns, options) {
  const moreRunsWillFollow = totalRuns - runIndex > 1;
  return options.delay > 0 && moreRunsWillFollow;
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
    this.runDelegate = engineDelegate.createDelegate(this.options);
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
    const iterations = new Array(options.iterations),
      runDelegate = this.runDelegate;
    const statistics = new Statistics();
    const collect = new Collect(statistics, storageManager, options);
    const iteration = new Iteration(
      url,
      storageManager,
      this.myExtensionServer,
      runDelegate,
      scriptsByCategory,
      asyncScriptsByCategory,
      options
    );

    // Put all the result from the runs here
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
      .then(() => runDelegate.onStartRun(url, options))
      .then(() =>
        Promise.reduce(
          iterations,
          (totalResult, item, runIndex, totalRuns) => {
            let promise = iteration
              .run(runIndex)
              .then(iterationData =>
                collect
                  .perRun(iterationData, totalResult, runIndex)
                  .then(() => totalResult)
              );
            if (shouldDelay(runIndex, totalRuns, options)) {
              promise = promise.delay(options.delay);
            }
            return promise;
          },
          result
        )
      )
      .then(() => this.runDelegate.onStopRun(result))
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
              `Number of HAR pages (${
                numPages
              }) does not match number of iterations (${options.iterations})`
            );
            return;
          }

          for (let run = 0; run < numPages; run++) {
            const page = result.har.log.pages[run];
            const visualMetric = result.visualMetrics[run];
            const browserScript = result.browserScripts[run] || {};
            const cpu = result.cpu[run] || {};
            engineUtils.addExtrasToHAR(
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
