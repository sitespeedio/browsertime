'use strict';

const merge = require('lodash.merge'),
  pick = require('lodash.pick'),
  isEmpty = require('lodash.isempty'),
  get = require('lodash.get'),
  forEach = require('lodash.foreach'),
  version = require('../../../package').version;

function generateUniquePageId(baseId, existingIdMap) {
  let newId = baseId;
  while (existingIdMap.has(newId)) {
    newId = newId + '-1';
  }

  return newId;
}

function jsonifyVisualProgress(visualProgress) {
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
}

module.exports = {
  addBrowser: function(har, name, version, comment) {
    merge(har.log, {
      browser: {
        name,
        version,
        comment
      }
    });

    if (!comment) {
      delete har.log.browser.comment;
    }

    return har;
  },

  addCreator: function(har, comment) {
    merge(har.log, {
      creator: {
        name: 'Browsertime',
        version: version,
        comment: comment
      }
    });

    if (!comment) {
      delete har.log.creator.comment;
    }

    return har;
  },

  mergeHars: function(hars) {
    if (isEmpty(hars)) {
      return undefined;
    }
    if (hars.length === 1) {
      return hars[0];
    }

    let firstLog = hars[0].log;
    let combinedHar = {
      log: pick(firstLog, ['version', 'creator', 'browser', 'comment'])
    };

    let pagesById = new Map();
    let allEntries = [];

    hars.forEach(har => {
      let pages = har.log.pages;
      let entries = har.log.entries;
      pages.forEach(page => {
        let pageId = page.id;
        if (pagesById.has(pageId)) {
          const oldPageId = pageId;
          pageId = generateUniquePageId(oldPageId, pagesById);
          page.id = pageId;
          entries = entries.map(entry => {
            if (entry.pageref === oldPageId) {
              entry.pageref = pageId;
            }
            return entry;
          });
        }
        pagesById.set(pageId, page);
      });
      allEntries = allEntries.concat(entries);
    });

    combinedHar.log.pages = Array.from(pagesById.values());
    combinedHar.log.entries = allEntries;

    return combinedHar;
  },
  addExtrasToHAR(index, harPage, visualMetricsData, timings, cpu, options) {
    const _meta = (harPage._meta = {});
    // If we have alias, use that.
    _meta.connectivity = get(options, 'connectivity.profile', 'native');
    _meta.connectivity = get(options, 'connectivity.alias', _meta.connectivity);
    const harPageTimings = harPage.pageTimings;

    const _visualMetrics = (harPage._visualMetrics = {});
    harPage._cpu = cpu;

    // We add the timings both as a hidden field and add
    // in pageTimings so we can easily show them in PerfCascade
    if (visualMetricsData) {
      const DO_NOT_INCLUDE_IN_HAR_TIMINGS = [
        'VisualReadiness',
        'SpeedIndex',
        'PerceptualSpeedIndex',
        'VisualProgress'
      ];

      for (let key of Object.keys(visualMetricsData)) {
        if (DO_NOT_INCLUDE_IN_HAR_TIMINGS.indexOf(key) === -1) {
          harPageTimings['_' + key.charAt(0).toLowerCase() + key.slice(1)] =
            visualMetricsData[key];
          _visualMetrics[key] = visualMetricsData[key];
        } else if (key !== 'VisualProgress') {
          _visualMetrics[key] = visualMetricsData[key];
        }
      }

      // Make the visual progress structure more JSON
      _visualMetrics.VisualProgress = jsonifyVisualProgress(
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
    if (options.resultURL) {
      const base = options.resultURL.endsWith('/')
        ? options.resultURL
        : options.resultURL + '/';
      if (options.screenshot) {
        _meta.screenshot = `${base}screenshots/${index + 1}.${
          options.screenshotParams.type
        }`;
      }
      if (options.video) {
        _meta.video = `${base}video/${index + 1}.mp4`;
      }
    }
  }
};
