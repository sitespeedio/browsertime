'use strict';
/*
 * Utility functions for managing statistics of collected metrics and timings.
 */

const get = require('lodash.get');
const set = require('lodash.set');
const Stats = require('fast-stats').Stats;
const log = require('intel').getLogger('browsertime');

function validateType(value, type, message) {
  if (typeof value !== type) {
    throw new TypeError(message || 'expected variable to be of type ' + type);
  }
}

function percentileName(percentile) {
  if (percentile === 0) {
    return 'min';
  } else if (percentile === 100) {
    return 'max';
  } else {
    return 'p' + String(percentile).replace('.', '_');
  }
}

class Statistics {
  constructor() {
    this.data = {};
  }

  add(key, value) {
    validateType(key, 'string', 'key (' + key + ') must be a string');
    validateType(value, 'number', 'value (' + value + ') must be a number');
    if (!isFinite(value)) {
      throw new RangeError("value can't be infinite");
    }

    let stats = this.data[key] || new Stats();
    this.data[key] = stats.push(value);
  }

  addAll(data) {
    let samples = Array.isArray(data) ? data : [data];

    samples.forEach(sample => {
      Object.keys(sample).forEach(key => {
        let value = sample[key];
        // TODO check type of value, to see if it should be included. Possibly via optional transform function
        this.add(key, value);
      });
    });

    return this;
  }

  addDeep(data, tranformFunction) {
    function isNumeric(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    }

    function addNumber(target, key, value) {
      let stats = get(target, key, new Stats());
      stats.push(value);
      set(target, key, stats);
    }

    function addRecursive(target, keyPrefix, value) {
      if (tranformFunction && keyPrefix.length > 0) {
        value = tranformFunction(keyPrefix, value);
      }
      const valueType = typeof value;

      switch (valueType) {
        case 'number':
          {
            addNumber(target, keyPrefix, value);
          }
          break;

        case 'object':
          {
            if (value === null) {
              break;
            }
            Object.keys(value).forEach(key => {
              const path = keyPrefix.concat([key]);
              addRecursive(target, path, value[key]);
            });
          }
          break;

        case 'string':
          {
            if (isNumeric(value)) {
              addNumber(target, keyPrefix, parseFloat(value));
            }
          }
          break;
        case 'boolean':
          {
            //  skip
          }
          break;

        default:
          log.error(
            'Unhandled value type %s found when adding data for %s ',
            valueType,
            keyPrefix
          );
      }
    }

    addRecursive(this.data, [], data);
  }

  // TODO this isn't used so we should just remove it
  summarize(options) {
    options = options || {};
    let percentiles = options.percentiles || [0, 10, 90, 99, 100];

    return Object.keys(this.data).reduce((results, key) => {
      let decimals = options.decimals || 0;
      let stats = get(this.data, [key]);
      if (options.iqr && stats.median() !== 0) {
        // https://en.wikipedia.org/wiki/Interquartile_range
        stats = stats.iqr();
      }
      if (stats.median() < 1 && stats.median() > 0) {
        decimals = 4;
      }
      const node = {
        median: parseFloat(stats.median().toFixed(decimals)),
        mean: parseFloat(stats.amean().toFixed(decimals)),
        mdev: parseFloat(
          stats.stddev() / Math.sqrt(stats.length).toFixed(decimals)
        ) // "standard deviation of the mean"
      };
      percentiles.forEach(function (p) {
        let name = percentileName(p);
        node[name] = parseFloat(stats.percentile(p).toFixed(decimals));
      });
      set(results, [key], node);

      return results;
    }, {});
  }

  summarizeDeep(options) {
    options = options || {};
    let percentiles = options.percentiles || [0, 10, 90, 99, 100];

    function summarize(stats) {
      let decimals = options.decimals || 0;
      if (
        options.iqr &&
        stats.median() !== 0 &&
        stats.range()[0] !== stats.range()[1]
      ) {
        // https://en.wikipedia.org/wiki/Interquartile_range
        stats = stats.iqr();
      }
      if (stats.median() < 1 && stats.median() > 0) {
        decimals = 4;
      }
      const results = {
        median: parseFloat(stats.median().toFixed(decimals)),
        mean: parseFloat(stats.amean().toFixed(decimals)),
        mdev: parseFloat((stats.stddev() / Math.sqrt(stats.length)).toFixed(4)), // "standard deviation of the mean"
        stddev: parseFloat(stats.stddev().toFixed(decimals))
      };
      percentiles.forEach(p => {
        let name = percentileName(p);
        results[name] = parseFloat(stats.percentile(p).toFixed(decimals));
      });
      return results;
    }

    function summarizeRecursive(target, keyPrefix, data) {
      if (data instanceof Stats) {
        set(target, keyPrefix, summarize(data));
      } else if (typeof data === 'object') {
        Object.keys(data).forEach(key => {
          const path = keyPrefix.concat([key]);
          summarizeRecursive(target, path, data[key]);
        });
      } else {
        throw new Error(
          'Unhandled data type ' + typeof data + ' found when summarizing data'
        );
      }
    }

    const result = {};
    summarizeRecursive(result, [], this.data);
    return result;
  }
}

module.exports = {
  Statistics: Statistics
};
