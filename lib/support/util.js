'use strict';

const groupBy = require('lodash.groupBy');

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
  getResultLogLine(result, options) {
    // don't bother if no statistics or silent x2
    if (!result.statistics || !result.statistics.timings || !result.statistics.timings.pageTimings || options.silent > 1) return result;

    let totalSize = 0;
    let requests = result.browserScripts[0].timings.resourceTimings.length + 1;

    if (result.har && result.har.log.pages[0] !== undefined) {
      // get the id
      let pageId = result.har.log.pages[0].id;
      let resourcesByPage = groupBy(result.har.log.entries, 'pageref');
      requests = resourcesByPage[pageId].length;
      for (const request of resourcesByPage[pageId]) {
        // transfer size
        totalSize += request.response.bodySize;
      }
      if (totalSize > 1024) {
        totalSize = (totalSize/1024).toFixed(2) + ' kb';
      } else {
        totalSize = totalSize + ' bytes';
      }
    }

    let nRuns = result.browserScripts.length,
      pt = result.statistics.timings.pageTimings,
      t = result.statistics.timings,
      m = nRuns > 1,
      lines = [
        `${requests} requests`,
        `${totalSize}`,
        this.formatMetric('firstPaint', t.firstPaint, m),
        this.formatMetric('DOMContentLoaded', pt.domContentLoadedTime, m),
        this.formatMetric('Load', pt.pageLoadTime, m),
        this.formatMetric('rumSpeedIndex', t.rumSpeedIndex, m),
      ],
      note = m ? ` (${nRuns} runs)` : '';

    lines = lines.filter(Boolean).join(', ');
    return `${lines}${note}`;
  }
};
