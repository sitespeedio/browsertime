'use strict';

module.exports = {
  toArray(arrayLike) {
    if (arrayLike == null) {
      return [];
    }
    if (Array.isArray(arrayLike)) {
      return arrayLike;
    }
    return [arrayLike];
  },
  isEmpty(o) {
    if (o === null || o === undefined)
      return true;

    if (typeof o === 'object')
      return Object.keys(o).length === 0;

    if (typeof o === 'string')
      return o.length === 0;

    return false;
  },
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
