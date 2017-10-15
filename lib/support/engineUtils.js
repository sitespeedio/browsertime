'use strict';

const path = require('path');
const forEach = require('lodash.foreach');
const moment = require('moment');
const get = require('lodash.get');
const util = require('../support/util');

module.exports = {
  loadPrePostScripts(scripts) {
    return util.toArray(scripts).map(script => {
      try {
        return require(path.resolve(script));
      } catch (e) {
        throw new Error(
          "Couldn't run pre/post script file: " + path.resolve(script) + ' ' + e
        );
      }
    });
  },

  jsonifyVisualProgress(visualProgress) {
    // Original data looks like
    //  "0=0%, 1500=81%, 1516=81%, 1533=84%, 1550=84%, 1566=84%, 1600=95%, 1683=95%, 1833=100%"
    const progress = visualProgress.split(',');
    const visualProgressJSON = {};
    forEach(progress, value => {
      const eachMetric = value.split('=');
      visualProgressJSON[eachMetric[0].replace(' ', '')] = Number(
        eachMetric[1].replace('%', '')
      );
    });
    return visualProgressJSON;
  },
  addExtrasToHAR(harPage, visualMetricsData, timings, options) {
    const _meta = (harPage._meta = {});
    _meta.connectivity = get(options, 'connectivity.profile', 'native');
    const harPageTimings = harPage.pageTimings;

    const _visualMetrics = (harPage._visualMetrics = {});

    // We add the timings both as a hidden field and add
    // in pageTimings so we can easily show them in PerfCascade
    if (visualMetricsData) {
      harPageTimings._firstVisualChange = visualMetricsData.FirstVisualChange;
      harPageTimings._lastVisualChange = visualMetricsData.LastVisualChange;
      harPageTimings._visualComplete85 = visualMetricsData.VisualComplete85;
      harPageTimings._visualComplete95 = visualMetricsData.VisualComplete95;
      harPageTimings._visualComplete99 = visualMetricsData.VisualComplete99;
      _visualMetrics.FirstVisualChange = visualMetricsData.FirstVisualChange;
      _visualMetrics.SpeedIndex = visualMetricsData.SpeedIndex;
      _visualMetrics.VisualComplete85 = visualMetricsData.VisualComplete85;
      _visualMetrics.VisualComplete95 = visualMetricsData.VisualComplete95;
      _visualMetrics.VisualComplete99 = visualMetricsData.VisualComplete99;
      _visualMetrics.LastVisualChange = visualMetricsData.LastVisualChange;

      // Make the visual progress structure more JSON
      _visualMetrics.VisualProgress = this.jsonifyVisualProgress(
        visualMetricsData.VisualProgress
      );
    } else if (timings && timings.firstPaint) {
      // only add first paint if we don't have visual metrics
      harPageTimings._firstPaint = timings.firstPaint;
    }
    if (timings && timings.pageTimings) {
      harPageTimings._domInteractiveTime =
        timings.pageTimings.domInteractiveTime;
      harPageTimings._domContentLoadedTime =
        timings.pageTimings.domContentLoadedTime;
    }
  },
  calculateViewport(options) {
    const emulatedWidth = get(options, 'chrome.mobileEmulation.width');
    const emulatedHeight = get(options, 'chrome.mobileEmulation.height');
    // you cannot set the width/height for phone so just keep the viewport undefined
    if (get(options, 'chrome.android.package')) {
      return;
    }

    if (emulatedWidth && emulatedHeight) {
      return `${emulatedWidth}x${emulatedHeight}`;
    }

    if (
      /^\d+x\d+$/.test(options.viewPort) ||
      (options.viewPort === 'maximize' && !options.xvfb)
    ) {
      return options.viewPort;
    }

    return '1200x960';
  },
  timestamp() {
    return moment().format();
  }
};
