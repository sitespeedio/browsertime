'use strict';

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
  }
};
