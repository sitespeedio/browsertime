'use strict';

const groupBy = require('lodash.groupby');

module.exports = {
  formatMetric(name, metric, multiple) {
      if (metric === undefined)
          return null;
      // 1200 -> 1.2
      function fmt(msec) {
          return (msec / 1000).toFixed(2).replace(/.0+$/, '');
      }

      let formatted = `${name}: ${fmt(metric.mean)}s`;
      if (multiple) {
          formatted += ` (±${fmt(metric.mdev)})`;
      }
      return formatted;
  },
  getResultLogLine(result) {
    let totalSize = 0;
    let requests = '';
    let firstPaint = '', domContent = '', pageLoad = '', rumSpeedIndex = '',
    nRuns = result.browserScripts.length,
    m = nRuns > 1;

    if (result.har) {
      // get the id
      let pageId = result.har.log.pages[0].id;
      let entriesByPage = groupBy(result.har.log.entries, 'pageref');
      requests = entriesByPage[pageId].length + ' requests';
      for (const request of entriesByPage[pageId]) {
        // transfer size
        totalSize += request.response.bodySize;
      }
      if (totalSize > 1024) {
        totalSize = (totalSize/1024).toFixed(2) + ' kb';
      } else {
        totalSize = totalSize + ' bytes';
      }
    }

    if (result.statistics.timings && result.statistics.timings.pageTimings) {
      let pt = result.statistics.timings.pageTimings,
      t = result.statistics.timings;

      firstPaint = this.formatMetric('firstPaint', t.firstPaint, m),
      domContent = this.formatMetric('DOMContentLoaded', pt.domContentLoadedTime, m),
      pageLoad = this.formatMetric('Load', pt.pageLoadTime, m),
      rumSpeedIndex = this.formatMetric('rumSpeedIndex', t.rumSpeedIndex, m);
    }

    let lines = [
        `${requests}`,
        `${totalSize}`,
        firstPaint,
        domContent,
        pageLoad,
        rumSpeedIndex
      ],
      note = m ? ` (${nRuns} runs)` : '';

    lines = lines.filter(Boolean).join(', ');
    return `${lines}${note}`;
  }
};
