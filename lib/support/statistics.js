/*
 * Utility functions for managing statistics of collected metrics and timings.
 */
'use strict';

const get = require('lodash.get'),
  set = require('lodash.set'),
  Stats = require('fast-stats').Stats;

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
      if (tranformFunction && keyPrefix) {
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
              addRecursive(
                target,
                [keyPrefix, key].filter(o => !!o).join('.'),
                value[key]
              );
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
          throw new Error(
            'Unhandled value type ' + valueType + ' found when adding data'
          );
      }
    }

    addRecursive(this.data, undefined, data);
  }

  summarize(options) {
    options = options || {};
    let percentiles = options.percentiles || [0, 10, 90, 99, 100];
    let decimals = options.decimals || 0;

    return Object.keys(this.data).reduce((results, key) => {
      let stats = this.data[key];
      results[key] = {
        median: Number(stats.median().toFixed(decimals)),
        mean: Number(stats.amean().toFixed(decimals)),
        mdev: Number(stats.stddev() / Math.sqrt(stats.length).toFixed(decimals)) // "standard deviation of the mean"
      };
      percentiles.forEach(function(p) {
        let name = percentileName(p);
        results[key][name] = Number(stats.percentile(p).toFixed(decimals));
      });
      return results;
    }, {});
  }

  summarizeDeep(options) {
    options = options || {};
    let percentiles = options.percentiles || [0, 10, 90, 99, 100];
    let decimals = options.decimals || 0;

    function summarize(stats) {
      const results = {
        median: Number(stats.median().toFixed(decimals)),
        mean: Number(stats.amean().toFixed(decimals)),
        mdev: Number(stats.stddev() / Math.sqrt(stats.length).toFixed(decimals)) // "standard deviation of the mean"
      };
      percentiles.forEach(p => {
        let name = percentileName(p);
        results[name] = Number(stats.percentile(p).toFixed(decimals));
      });
      return results;
    }

    function summarizeRecursive(target, keyPrefix, data) {
      if (data instanceof Stats) {
        set(target, keyPrefix, summarize(data));
      } else if (typeof data === 'object') {
        Object.keys(data).forEach(key => {
          summarizeRecursive(
            target,
            [keyPrefix, key].filter(o => !!o).join('.'),
            data[key]
          );
        });
      } else {
        throw new Error(
          'Unhandled data type ' + typeof data + ' found when summarizing data'
        );
      }
    }

    const result = {};
    summarizeRecursive(result, undefined, this.data);
    return result;
  }
}

module.exports = {
  Statistics: Statistics
};
