'use strict';

const groupBy = require('lodash.groupby');

module.exports = {
  formatMetric(name, metric, multiple, inMs) {
    if (metric === undefined) return null;
    function fmt(value) {
      if (inMs) {
        if (value < 1000) {
          return value + 'ms';
        } else {
          return (value / 1000).toFixed(2).replace(/\.0+$/, '') + 's';
        }
      } else return value;
    }

    let formatted = `${name}: ${fmt(metric.mean)}`;
    if (multiple) {
      formatted += ` (±${fmt(metric.mdev.toFixed(2))})`;
    }
    return formatted;
  },
  getResultLogLine(result) {
    let totalSize = 0;
    let requests = '';
    let firstPaint = '',
      domContent = '',
      pageLoad = '',
      rumSpeedIndex = '',
      speedIndex = '',
      startRender = '',
      visualComplete85 = '',
      backEndTime = '',
      lastVisualChange = '',
      nRuns = result.browserScripts.length,
      m = nRuns > 1;

    if (result.har && result.har.log.pages[0]) {
      // get the id
      let pageId = result.har.log.pages[0].id;
      let entriesByPage = groupBy(result.har.log.entries, 'pageref');
      requests = entriesByPage[pageId].length + ' requests';
      for (const request of entriesByPage[pageId]) {
        // transfer size
        totalSize += request.response.bodySize;
      }
      if (totalSize > 1024) {
        totalSize = (totalSize / 1024).toFixed(2) + ' kb';
      } else {
        totalSize = totalSize + ' bytes';
      }
    }

    if (result.statistics.timings && result.statistics.timings.pageTimings) {
      let pt = result.statistics.timings.pageTimings,
        t = result.statistics.timings,
        vm = result.statistics.visualMetrics;

      firstPaint = this.formatMetric('firstPaint', t.firstPaint, m, true);
      domContent = this.formatMetric(
        'DOMContentLoaded',
        pt.domContentLoadedTime,
        m,
        true
      );
      speedIndex = this.formatMetric('speedIndex', vm ? vm.SpeedIndex : vm, m);
      startRender = this.formatMetric(
        'firstVisualChange',
        vm ? vm.FirstVisualChange : vm,
        m,
        true
      );
      lastVisualChange = this.formatMetric(
        'lastVisualChange',
        vm ? vm.LastVisualChange : vm,
        m,
        true
      );
      visualComplete85 = this.formatMetric(
        'visualComplete85',
        vm ? vm.VisualComplete85 : vm,
        m,
        true
      );
      pageLoad = this.formatMetric('Load', pt.pageLoadTime, m, true);
      rumSpeedIndex = this.formatMetric('rumSpeedIndex', t.rumSpeedIndex, m);
      backEndTime = this.formatMetric('backEndTime', pt.backEndTime, m, true);
    }

    let lines = [
        `${requests}`,
        `${totalSize}`,
        backEndTime,
        firstPaint,
        startRender,
        domContent,
        pageLoad,
        speedIndex,
        visualComplete85,
        lastVisualChange,
        rumSpeedIndex
      ],
      note = m ? ` (${nRuns} runs)` : '';

    lines = lines.filter(Boolean).join(', ');
    return `${lines}${note}`;
  },
  toArray(arrayLike) {
    if (arrayLike === undefined || arrayLike === null) {
      return [];
    }
    if (Array.isArray(arrayLike)) {
      return arrayLike;
    }
    return [arrayLike];
  }
};
