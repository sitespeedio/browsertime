'use strict';

const log = require('intel').getLogger('browsertime.command.measure');
const get = require('lodash.get');
const engineUtils = require('../../../support/engineUtils');
const Video = require('../../../video/video');
const merge = require('lodash.merge');
const pathToFolder = require('../../../support/pathToFolder');
const path = require('path');
const setOrangeBackground = require('../../../video/screenRecording/setOrangeBackground');
const { filterWhitelisted } = require('../../../support/userTiming');
const { isAndroidConfigured, Android } = require('../../../android');
const TCPDump = require('../../../support/tcpdump');
const delay = ms => new Promise(res => setTimeout(res, ms));

// Make this configurable
const ANDROID_DELAY_TIME = 2000;
const IOS_DELAY_TIME = 1000;

// In some cases we could have one alias mapped to multiple URLs
// we've seen it for login etc where the user get different query parameter
// values. So map alias = url 1:1
const aliasAndUrl = {};

function getNewResult() {
  return {
    extraJson: {},
    timestamp: engineUtils.timestamp(),
    extras: {}
  };
}

class Measure {
  constructor(
    browser,
    index,
    pageCompleteCheck,
    result,
    engineDelegate,
    extensionServer,
    storageManager,
    videos,
    scriptsByCategory,
    asyncScriptsByCategory,
    postURLScripts,
    context,
    screenshotManager,
    options
  ) {
    this.browser = browser;
    this.pageCompleteCheck = pageCompleteCheck;
    this.index = index;
    this.result = result;
    this.engineDelegate = engineDelegate;
    this.options = options;
    this.screenshotManager = screenshotManager;
    this.storageManager = storageManager;
    this.recordVideo = options.visualMetrics || options.video;
    this.extensionServer = extensionServer;
    this.videos = videos;
    this.scriptsByCategory = scriptsByCategory;
    this.asyncScriptsByCategory = asyncScriptsByCategory;
    this.postURLScripts = postURLScripts;
    this.context = context;
    this.numberOfMeasuredPages = 0;
    this.numberOfVisitedPages = 0;
    this.areWeMeasuring = false;
    this.testedURLs = {};
    this.tcpDump = new TCPDump(storageManager.directory, options);
  }

  // Have a consistent way of starting the video
  async _startVideo(numberOfMeasuredPages, index) {
    this.video = new Video(this.storageManager, this.options, this.browser);

    if (this.options.firefox && this.options.firefox.windowRecorder) {
      // The Firefox window recorder will only record subsequent
      // changes after recording has begun.  So the orange frame needs
      // to come after we start recording.
      await this.video.record(numberOfMeasuredPages, index);
      await setOrangeBackground(this.browser.getDriver(), this.options);
    } else {
      await setOrangeBackground(this.browser.getDriver(), this.options);
      await this.video.record(numberOfMeasuredPages, index);
    }

    // Give ffmpeg/video on phone time to settle
    if (isAndroidConfigured(this.options)) {
      return delay(ANDROID_DELAY_TIME);
    } else if (this.options.safari && this.options.safari.useSimulator) {
      return delay(IOS_DELAY_TIME);
    } else {
      return delay(400);
    }
  }

  _error(message) {
    // If we already are measuring a page, associate the error woth that page
    if (this.areWeMeasuring === true) {
      if (!this.result[this.numberOfMeasuredPages].error) {
        this.result[this.numberOfMeasuredPages].error = [message];
      } else {
        this.result[this.numberOfMeasuredPages].error.push(message);
      }
    } else {
      // If we have tested pages before, but not in the making of
      // measuring a page, associate the error with that latest page.
      if (this.result.length > 0) {
        if (this.result[this.result.length - 1].error === undefined) {
          this.result[this.result.length - 1].error = [message];
        } else {
          this.result[this.result.length - 1].error.push(message);
        }
      } else {
        //  error not associated to a start/run so far
        log.error('No page that could be associated with the error:' + message);
      }
    }
  }
  async _navigate(url) {
    log.info('Navigating to url %s iteration %s', url, this.index);
    if (this.numberOfVisitedPages === 0) {
      await this.extensionServer.setup(url, this.browser, this.options);
    }
    if (this.numberOfVisitedPages === 0) {
      await this.engineDelegate.beforeStartIteration(this.browser, this.index);
    }
    this.numberOfVisitedPages++;
    return this.browser.loadAndWait(url, this.pageCompleteCheck);
  }

  /**
   *  Start collecting metrics for a URL. If you supply a URL to this method, the browser will navigate to that URL.
   *  If you do not use an URL (start()) everything is prepared for a new page to measure except the browser do not
   *  navigate to a new URL. You can also add an alias for the URL.
   * @param {string} urlOrAlias
   * @param {string} optionalAlias
   * @returns {Promise} Promise object represents when the URL has been navigated and finished loading according to the pageCompleteCheck or when everything is setup for measuring a new URL (if no URL is supplied).
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

    // On the first page of an iteration, do what you need to do!
    if (this.numberOfVisitedPages === 0 && url) {
      // We can only setup the extension if we have a URL at the moment
      await this.extensionServer.setup(url, this.browser, this.options);
    }
    if (this.numberOfVisitedPages === 0) {
      await this.engineDelegate.beforeStartIteration(this.browser, this.index);
    }

    this.result.push(getNewResult());
    this.result[this.numberOfMeasuredPages].timestamp = engineUtils.timestamp();

    if (alias || optionalAlias) {
      this.result[this.numberOfMeasuredPages].alias = alias || optionalAlias;
    }

    if (this.options.spa) {
      // Make sure that the resource timing is empty
      await this.browser
        .getDriver()
        .executeScript('window.performance.clearResourceTimings();');
    }

    if (this.recordVideo && !this.options.videoParams.debug) {
      await this._startVideo(this.numberOfMeasuredPages, this.index);
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
        await this.browser.loadAndWait(url, this.pageCompleteCheck);
        return this.stop(url);
      } catch (e) {
        this.result[this.numberOfMeasuredPages].error = [e.name];
        // The page failed loading but make sure we keep track of
        // how many pages we tried to measure
        this.numberOfMeasuredPages++;
        this.numberOfVisitedPages++;
        this.engineDelegate.failing(url);
        throw e;
      }
    } else {
      this.areWeMeasuring = true;
      return this.engineDelegate.beforeEachURL(this.browser);
    }
  }

  /**
   * Stop measuring and collect all the metrics.
   * @returns {Promise} Promise object represents all the metrics has been collected.
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
      if (url.indexOf('?') > -1) {
        url = url + '&browsertime_run=' + this.testedURLs[url];
      } else {
        url = url + '?browsertime_run=' + this.testedURLs[url];
      }
    } else {
      this.testedURLs[url] = 1;
    }

    // There's a use case where you only add an alias in script, if that's the case
    // we also need to add that to the meta data so that the correct folder is created
    if (this.result[this.numberOfMeasuredPages].alias) {
      if (this.options.urlMetaData) {
        this.options.urlMetaData[url] = this.result[
          this.numberOfMeasuredPages
        ].alias;
      } else {
        this.options.urlMetaData = {};
        this.options.urlMetaData[url] = this.result[
          this.numberOfMeasuredPages
        ].alias;
      }
    }

    // We have the URL, create the data dir
    await this.storageManager.createSubDataDir(
      path.join(pathToFolder(url, this.options))
    );
    if (this.recordVideo && !this.options.videoParams.debug) {
      await this.video.stop(url);
      this.videos.push(this.video);
    }
    const alias = this.options.urlMetaData
      ? this.options.urlMetaData[url]
      : undefined || this.result[this.numberOfMeasuredPages].alias;
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
    return this.collect(url);
  }

  /**
   * Add your own metric.
   * @param {string} name
   * @param {*} value
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
   * Add your own metrics. You can add an object witch multiple keys and they will all be collected.
   * @param {*} object
   */
  addObject(object) {
    if (this.result[this.numberOfMeasuredPages - 1]) {
      merge(this.result[this.numberOfMeasuredPages - 1].extras, object);
    } else
      log.error(
        'You need to have done one (start/stop) measurement before you can add any metrics to a result.'
      );
  }

  async collect(url) {
    if (this.options.tcpdump) {
      await this.tcpDump.stop();
    }
    // This stops collecting trace logs in Chrome etc
    // await this.engineDelegate.beforeCollect();

    log.verbose('Collecting metrics');

    // If we have an alias for the URL, use that URL
    if (
      this.result[this.numberOfMeasuredPages] &&
      this.result[this.numberOfMeasuredPages].alias
    ) {
      const alias = this.result[this.numberOfMeasuredPages].alias;
      if (!aliasAndUrl[alias]) {
        aliasAndUrl[alias] = url;
      } else {
        url = aliasAndUrl[alias];
      }
    }

    this.result[this.numberOfMeasuredPages].url = url;

    // when we have the URL we can use that to stop the video and put it where we want it
    if (
      this.recordVideo &&
      !this.options.videoParams.debug &&
      this.video.getRecordingStartTime()
    ) {
      this.result[this.numberOfMeasuredPages].recordingStartTime = parseFloat(
        this.video.getRecordingStartTime()
      );
      this.result[this.numberOfMeasuredPages].timeToFirstFrame = parseInt(
        this.video.getTimeToFirstFrame(),
        10
      );
    }

    if (this.options.screenshot) {
      try {
        const screenshot = await this.browser.takeScreenshot(url);
        await this.screenshotManager.save(
          'afterPageCompleteCheck',
          screenshot,
          url,
          this.index
        );
      } catch (e) {
        // not getting screenshots shouldn't result in a failed test.
      }
    }

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

    // Some sites has crazy amount of user timings:
    // strip them if you want
    if (this.options.userTimingWhitelist) {
      filterWhitelisted(
        this.result[this.numberOfMeasuredPages].browserScripts.timings
          .userTimings,
        this.options.userTimingWhitelist
      );
    }

    if (isAndroidConfigured(this.options) && this.options.processStartTime) {
      const packageName =
        this.options.browser === 'firefox'
          ? get(this.options, 'firefox.android.package', 'org.mozilla.firefox')
          : get(this.options, 'chrome.android.package');

      const android = new Android(this.options);
      const pid = await android.pidof(packageName);

      if (pid) {
        const processStartTime = await android.processStartTime(pid);
        this.result[
          this.numberOfMeasuredPages
        ].browserScripts.browser.processStartTime = processStartTime;
      }
    }

    for (const postURLScript of this.postURLScripts) {
      await postURLScript(this.context);
    }

    if (this.options.tcpdump) {
      this.tcpDump.mv(url, this.index);
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

module.exports = Measure;
