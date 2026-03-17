import path from 'node:path';
import { getLogger } from '@sitespeed.io/log';
import merge from 'lodash.merge';
import { timestamp as _timestamp } from '../../../support/engineUtils.js';
import { pathToFolder } from '../../../support/pathToFolder.js';
import {
  filterAllowlisted,
  filterBlocklisted
} from '../../../support/userTiming.js';
import { isAndroidConfigured, Android } from '../../../android/index.js';
import { TCPDump } from '../../../support/tcpdump.js';
import { getProperty } from '../../../support/util.js';
import { MeasureScreenshots } from './measure/screenshots.js';
import { MeasureVideo } from './measure/video.js';
const log = getLogger('browsertime.command.measure');

// In some cases we could have one alias mapped to multiple URLs
// we've seen it for login etc where the user get different query parameter
// values. So map alias = url 1:1
const aliasAndUrl = {};

function getNewResult() {
  return {
    extraJson: {},
    timestamp: _timestamp(),
    extras: {}
  };
}

/**
 * A measurement tool for browser-based metrics, handling various aspects
 * of metric collection including navigation, video recording, and data collection.
 *
 * @class
 * @hideconstructor
 */
export class Measure {
  constructor({
    browser,
    index,
    pageCompleteCheck,
    result,
    engineDelegate,
    storageManager,
    videos,
    scriptsByCategory,
    asyncScriptsByCategory,
    postURLScripts,
    context,
    screenshotManager,
    options
  }) {
    /**
     * @private
     */
    this.browser = browser;
    /**
     * @private
     */
    this.pageCompleteCheck = pageCompleteCheck;
    /**
     * @private
     */
    this.index = index;
    /**
     * @private
     */
    this.result = result;
    /**
     * @private
     */
    this.engineDelegate = engineDelegate;
    /**
     * @private
     */
    this.options = options;
    /**
     * @private
     */
    this.storageManager = storageManager;
    /**
     * @private
     */
    this.scriptsByCategory = scriptsByCategory;
    /**
     * @private
     */
    this.asyncScriptsByCategory = asyncScriptsByCategory;
    /**
     * @private
     */
    this.postURLScripts = postURLScripts;
    /**
     * @private
     */
    this.context = context;
    /**
     * @private
     */
    this.numberOfMeasuredPages = 0;
    /**
     * @private
     */
    this.numberOfVisitedPages = 0;
    /**
     * @private
     */
    this.areWeMeasuring = false;
    /**
     * @private
     */
    this.testedURLs = {};
    /**
     * @private
     */
    this.tcpDump = new TCPDump(storageManager.directory, options);
    /**
     * @private
     */
    this.measureVideo = new MeasureVideo(
      storageManager,
      browser,
      videos,
      options
    );
    /**
     * @private
     */
    this.screenshots = new MeasureScreenshots(
      browser,
      screenshotManager,
      options
    );
  }

  /**
   * Have a consistent way of adding an error
   * @private
   */
  _error(message) {
    // If we already are measuring a page, associate the error woth that page
    if (this.areWeMeasuring === true) {
      if (this.result[this.numberOfMeasuredPages].error) {
        this.result[this.numberOfMeasuredPages].error.push(message);
      } else {
        this.result[this.numberOfMeasuredPages].error = [message];
      }
    } else {
      // If we have tested pages before, but not in the making of
      // measuring a page, associate the error with that latest page.
      if (this.result.length > 0) {
        if (this.result.at(-1).error === undefined) {
          this.result.at(-1).error = [message];
        } else {
          this.result.at(-1).error.push(message);
        }
      }
    }
    // Add the error in the generic failure
    if (this.result.failureMessages) {
      this.result.failureMessages.push(message);
    } else {
      this.result.failureMessages = [message];
    }
  }

  /**
   * Have a consistent way of adding an failure
   * @private
   */
  _failure(message) {
    log.info('Mark run as failure with message: %s', message);
    this.result.markedAsFailure = 1;
    if (this.result.failureMessages) {
      this.result.failureMessages.push(message);
    } else {
      this.result.failureMessages = [message];
    }
  }

  /**
   * Navigates to a specified URL and handles additional setup for the first page visit.
   *
   * This function is responsible for setting up the browser with necessary configurations and
   * navigating to the URL. It also waits for the page
   * to load completely based on configured page completion check.
   *
   * @async
   * @private
   * @param {string} url - The URL to navigate to.
   * @throws {Error} Throws an error if navigation or setup fails.
   * @returns {Promise<void>} A promise that resolves when the navigation and setup are complete.
   */
  async _navigate(url) {
    log.info('Navigating to url %s iteration %s', url, this.index);
    if (
      this.numberOfVisitedPages === 0 && // There's a bug that we introduced when moving cookie handling to CDP
      // and this is the hack to fix that.
      ((this.options.cookie && this.options.browser === 'chrome') ||
        this.options.browser === 'edge')
    ) {
      await this.engineDelegate.setCookies(url, this.options.cookie);
    }
    if (this.numberOfVisitedPages === 0) {
      await this.engineDelegate.beforeStartIteration(this.browser, this.index);
    }
    this.numberOfVisitedPages++;
    return this.browser.loadAndWait(
      url,
      this.pageCompleteCheck,
      this.engineDelegate
    );
  }

  /**
   * Starts the measurement process for a given URL or an alias.
   *
   * It supports starting measurements by either directly providing a URL or using an alias.
   * If a URL is provided, it navigates to that URL and performs the measurement.
   * If an alias is provided, or no URL is available, it sets up the environment for a user-driven navigation.
   *
   * @async
   * @example
   * await commands.measure.start('https://www.example.org');
   * // Or start the measurement and click on a link
   * await commands.measure.start();
   * await commands.click.byLinkTextAndWait('Documentation');
   * // Remember to stop the measurements if you do not provide a URL
   * await commands.measure.stop();
   * @param {string} urlOrAlias - The URL to navigate to, or an alias representing the test.
   * @param {string} [optionalAlias] - An optional alias that can be used if the first parameter is a URL.
   * @throws {Error} Throws an error if navigation fails or if there are issues in the setup process.
   * @returns {Promise<void>} A promise that resolves when the start process is complete, or rejects if there are errors.
   */
  async start(urlOrAlias, optionalAlias) {
    let url, alias;
    if (
      urlOrAlias &&
      (urlOrAlias.startsWith('http') || urlOrAlias.startsWith('data:text'))
    ) {
      url = urlOrAlias;
      log.info('Testing url %s iteration %s', url, this.index);
    } else if (urlOrAlias) {
      alias = urlOrAlias;
      log.info('Start to measure %s', alias);
    } else {
      log.info('Start to measure');
    }

    if (this.numberOfVisitedPages === 0) {
      await this.engineDelegate.beforeStartIteration(this.browser, this.index);
    }

    this.result.push(getNewResult());
    this.result[this.numberOfMeasuredPages].timestamp = _timestamp();

    if (alias || optionalAlias) {
      this.result[this.numberOfMeasuredPages].alias = alias || optionalAlias;
    }

    if (this.options.spa) {
      // Make sure that the resource timing is empty
      await this.browser
        .getDriver()
        .executeScript('window.performance.clearResourceTimings();');
    }

    if (this.measureVideo.shouldRecord()) {
      await this.measureVideo.start(this.numberOfMeasuredPages, this.index);
      // if we do not have the URL, we should remove the orange and
      // start meausuring because the user themself will navigate to
      // the URL that will be tested.
      if (!url) {
        const removeOrange = `(function() {
          const orange = document.getElementById('browsertime-orange');
          if (orange) {
            orange.parentNode.removeChild(orange);
          }
        })();`;
        await this.browser.getDriver().executeScript(removeOrange);
      }
    }

    // await this.engineDelegate.clear(this.browser);

    if (this.options.tcpdump) {
      await this.tcpDump.start(this.index);
    }
    if (url) {
      // We jack in the URL that we wanna test and then override it from the browser
      this.result[this.numberOfMeasuredPages].url = url;
      try {
        await this.engineDelegate.beforeEachURL(this.browser, url);
        await this.browser.loadAndWait(
          url,
          this.pageCompleteCheck,
          this.engineDelegate
        );
        return this.stop(url);
      } catch (error) {
        this.result[this.numberOfMeasuredPages].error = [error.name];
        // The page failed loading but make sure we keep track of
        // how many pages we tried to measure
        this.numberOfMeasuredPages++;
        this.numberOfVisitedPages++;
        this.engineDelegate.failing(url);
        // If we got an error we still should stop the video to make sure we can use it to
        // try to understand what went wrong
        await this.measureVideo.stop(url);
        throw error;
      }
    } else {
      this.areWeMeasuring = true;
      return this.engineDelegate.beforeEachURL(this.browser);
    }
  }

  /**
   * Stop the current measurement and mark it as a failure. This stop function will not measure anything on a page. This is useful if you need to stop a measurement in a (try) catch and you
   * know something has failed.
   *
   * @async
   * @param {string} errorMessage - The message about the error. This will end up on the HTML report for sitespeed.io so give it a good message so you know what's gone wrong.
   * @returns {Promise} A promise that resolves when the stop process has completed.
   * @since 21.2.0
   */
  async stopAsError(errorMessage) {
    this._failure(errorMessage);
    this.areWeMeasuring = false;
    // Remove the last result
    this.result.pop();

    await this.measureVideo.stop();

    if (this.options.tcpdump) {
      await this.tcpDump.stop();
    }

    return;
  }
  /**
   * Stops the measurement process, collects metrics, and handles any post-measurement tasks.
   * It finalizes the URL being tested, manages any URL-specific metadata, stops any ongoing video recordings,
   * and initiates the data collection process.
   *
   * @async
   * @param {string} testedStartUrl - The URL that was initially tested. If not provided, it will be obtained from the browser.
   * @throws {Error} Throws an error if there are issues in stopping the measurement or collecting data.
   * @returns {Promise} A promise that resolves with the collected metrics data.
   */
  async stop(testedStartUrl) {
    log.debug('Stop measuring');
    // If we don't have a URL (tested using clicking on link etc) get the URL from the browser
    let url =
      testedStartUrl ||
      (await this.browser.runScript('return document.URL', 'PAGE_URL'));

    if (this.testedURLs[url]) {
      log.info(
        '%s has been tested before within the same run, it will get an extra query parameter named browsertime_run. Make sure to use alias to keep track of the URLs',
        url
      );
      this.testedURLs[url] = this.testedURLs[url] + 1;
      url = url.includes('?')
        ? url + '&browsertime_run=' + this.testedURLs[url]
        : url + '?browsertime_run=' + this.testedURLs[url];
    } else {
      this.testedURLs[url] = 1;
    }

    // There's a use case where you only add an alias in script, if that's the case
    // we also need to add that to the meta data so that the correct folder is created
    if (this.result[this.numberOfMeasuredPages].alias) {
      if (this.options.urlMetaData) {
        this.options.urlMetaData[url] =
          this.result[this.numberOfMeasuredPages].alias;
      } else {
        this.options.urlMetaData = {};
        this.options.urlMetaData[url] =
          this.result[this.numberOfMeasuredPages].alias;
      }
    }

    // We have the URL, create the data dir
    await this.storageManager.createSubDataDir(
      path.join(pathToFolder(url, this.options))
    );
    await this.measureVideo.stop(url);

    const alias = this.options.urlMetaData
      ? this.options.urlMetaData[url]
      : // eslint-disable-next-line no-constant-binary-expression
        undefined || this.result[this.numberOfMeasuredPages].alias;
    const res = await this.engineDelegate.afterPageCompleteCheck(
      this.browser,
      this.index,
      url,
      alias
    );

    // Add the alias from the options to the result to follow the same pattern as if we have the alias in the script file
    if (
      this.options.urlMetaData &&
      this.options.urlMetaData[url] &&
      !res.alias
    ) {
      res.alias = this.options.urlMetaData[url];
    }

    this.result[this.numberOfMeasuredPages] = merge(
      this.result[this.numberOfMeasuredPages],
      res
    );

    if (this.options.tcpdump) {
      await this.tcpDump.stop();
    }

    return this._collect(url);
  }

  /**
   * Adds a custom metric to the current measurement result.
   * The metric will be attached to the latest tested page, meaming
   * you need to have measured a URL and stopped the measurement before
   * you add the metric.
   * @param {string} name - The name of the metric.
   * @param {*} value - The value of the metric.
   * @throws {Error} Throws an error if called before a measurement cycle has started.
   */
  add(name, value) {
    if (this.result[this.numberOfMeasuredPages - 1]) {
      this.result[this.numberOfMeasuredPages - 1].extras[name] = value;
    } else {
      log.error(
        'You need to have done one (start/stop) measurement before you can add any metrics to a result.'
      );
    }
  }

  /**
   * Adds multiple custom metrics to the current measurement result.
   * This method accepts an object containing multiple key-value pairs representing different metrics.
   * The metric will be attached to the latest tested page, meaming
   * you need to have measured a URL and stopped the measurement before
   * you add the metric.
   *
   * @param {Object} object - An object containing key-value pairs of metrics to add.
   * @throws {Error} Throws an error if called before a measurement cycle has started.
   */
  addObject(object) {
    if (this.result[this.numberOfMeasuredPages - 1]) {
      merge(this.result[this.numberOfMeasuredPages - 1].extras, object);
    } else
      log.error(
        'You need to have done one (start/stop) measurement before you can add any metrics to a result.'
      );
  }

  /**
   * @private
   */
  _resolveAlias(url) {
    if (
      this.result[this.numberOfMeasuredPages] &&
      this.result[this.numberOfMeasuredPages].alias
    ) {
      const alias = this.result[this.numberOfMeasuredPages].alias;
      if (aliasAndUrl[alias]) {
        return aliasAndUrl[alias];
      }
      aliasAndUrl[alias] = url;
    }
    return url;
  }

  /**
   * @private
   */
  _attachVideoMetadata() {
    const metadata = this.measureVideo.getRecordingMetadata();
    if (metadata) {
      this.result[this.numberOfMeasuredPages].recordingStartTime =
        metadata.recordingStartTime;
      this.result[this.numberOfMeasuredPages].timeToFirstFrame =
        metadata.timeToFirstFrame;
    }
  }

  /**
   * @private
   */
  async _collectBrowserScripts() {
    const syncScripts = this.scriptsByCategory
        ? await this.browser.runScripts(this.scriptsByCategory)
        : {},
      asyncScripts = this.asyncScriptsByCategory
        ? await this.browser.runScripts(this.asyncScriptsByCategory, true)
        : {};

    this.result[this.numberOfMeasuredPages].browserScripts = merge(
      {},
      syncScripts,
      asyncScripts
    );
  }

  /**
   * @private
   */
  _filterUserTimings() {
    // Some sites has crazy amount of user timings:
    // strip them if you want
    if (this.options.userTimingAllowList) {
      filterAllowlisted(
        this.result[this.numberOfMeasuredPages].browserScripts.timings
          .userTimings,
        this.options.userTimingAllowList
      );
    }

    if (this.options.userTimingBlockList) {
      filterBlocklisted(
        this.result[this.numberOfMeasuredPages].browserScripts.timings
          .userTimings,
        this.options.userTimingBlockList
      );
    }
  }

  /**
   * @private
   */
  async _collectAndroidProcessTime() {
    if (isAndroidConfigured(this.options) && this.options.processStartTime) {
      const packageName =
        this.options.browser === 'firefox'
          ? getProperty(
              this.options,
              'firefox.android.package',
              'org.mozilla.firefox'
            )
          : getProperty(this.options, 'chrome.android.package');

      const android = new Android(this.options);
      const pid = await android.pidof(packageName);

      if (pid) {
        const processStartTime = await android.processStartTime(pid);
        this.result[
          this.numberOfMeasuredPages
        ].browserScripts.browser.processStartTime = processStartTime;
      }
    }
  }

  /**
   * @private
   */
  async _runPostURLScripts() {
    for (const postURLScript of this.postURLScripts) {
      await postURLScript(this.context);
    }
  }

  /**
   * @private
   */
  async _collect(url) {
    log.verbose('Collecting metrics');

    url = this._resolveAlias(url);
    this.result[this.numberOfMeasuredPages].url = url;

    this._attachVideoMetadata();
    await this.screenshots.afterPageCompleteCheck(url, this.index);
    await this.screenshots.layoutShift(url, this.index);
    await this.screenshots.largestContentfulPaint(url, this.index);
    await this._collectBrowserScripts();
    this._filterUserTimings();
    await this._collectAndroidProcessTime();
    await this._runPostURLScripts();

    if (this.options.tcpdump) {
      await this.tcpDump.mv(url, this.index);
    }

    await this.engineDelegate.afterEachURL(
      this.browser,
      this.index,
      this.result[this.numberOfMeasuredPages]
    );
    this.numberOfMeasuredPages++;
    this.numberOfVisitedPages++;
    this.areWeMeasuring = false;
  }
}
