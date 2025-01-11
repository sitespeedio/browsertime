import { Stats } from 'fast-stats';
import { getLogger } from '@sitespeed.io/log';

import { getProperty, setProperty } from './util.js';

const log = getLogger('browsertime');

function validateType(value, type, message) {
  if (typeof value !== type) {
    throw new TypeError(message || 'expected variable to be of type ' + type);
  }
}

function hasDecimals(num) {
  return num !== Math.floor(num);
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

function isNumeric(n) {
  return !Number.isNaN(Number.parseFloat(n)) && Number.isFinite(n);
}

function addNumber(target, key, value) {
  let stats = getProperty(target, key, new Stats());
  stats.push(value);
  setProperty(target, key, stats);
}

export class Statistics {
  constructor() {
    this.data = {};
  }

  add(key, value) {
    validateType(key, 'string', 'key (' + key + ') must be a string');
    validateType(value, 'number', 'value (' + value + ') must be a number');
    if (!Number.isFinite(value)) {
      throw new RangeError("value can't be infinite");
    }

    let stats = this.data[key] || new Stats();
    this.data[key] = stats.push(value);
  }

  addAll(data) {
    let samples = Array.isArray(data) ? data : [data];

    for (const sample of samples) {
      for (const key of Object.keys(sample)) {
        let value = sample[key];
        // TODO check type of value, to see if it should be included. Possibly via optional transform function
        this.add(key, value);
      }
    }

    return this;
  }

  addDeep(data, tranformFunction) {
    function addRecursive(target, keyPrefix, value) {
      if (tranformFunction && keyPrefix.length > 0) {
        value = tranformFunction(keyPrefix, value);
      }
      const valueType = typeof value;

      switch (valueType) {
        case 'number': {
          {
            addNumber(target, keyPrefix, value);
          }
          break;
        }

        case 'object': {
          {
            if (value === null) {
              break;
            }
            for (const key of Object.keys(value)) {
              const path = [...keyPrefix, key];
              addRecursive(target, path, value[key]);
            }
          }
          break;
        }

        case 'string': {
          {
            if (isNumeric(value)) {
              addNumber(target, keyPrefix, Number.parseFloat(value));
            }
          }
          break;
        }
        case 'boolean': {
          {
            //  skip
          }
          break;
        }

        default: {
          log.error(
            'Unhandled value type %s found when adding data for %s ',
            valueType,
            keyPrefix
          );
        }
      }
    }

    addRecursive(this.data, [], data);
  }

  // TODO this isn't used so we should just remove it
  summarize(options) {
    options = options || {};
    let percentiles = options.percentiles || [0, 10, 90, 99, 100];

    // eslint-disable-next-line unicorn/no-array-reduce
    return Object.keys(this.data).reduce((results, key) => {
      let decimals = options.decimals || 0;
      let stats = getProperty(this.data, [key]);
      if (options.iqr && stats.median() !== 0) {
        // https://en.wikipedia.org/wiki/Interquartile_range
        stats = stats.iqr();
      }
      if (stats.median() < 10 && stats.median() > 0) {
        decimals = 4;
      }
      const node = {
        median: Number.parseFloat(stats.median().toFixed(decimals)),
        mean: Number.parseFloat(stats.amean().toFixed(decimals)),
        mdev: Number.parseFloat(
          stats.stddev() / Math.sqrt(stats.length).toFixed(decimals)
        ) // "standard deviation of the mean"
      };
      for (const p of percentiles) {
        let name = percentileName(p);
        node[name] = Number.parseFloat(stats.percentile(p).toFixed(decimals));
      }
      setProperty(results, [key], node);

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
      } else if (
        hasDecimals(stats.median()) &&
        stats.median() < 100 &&
        stats.median() > 1
      ) {
        decimals = 2;
      }
      const results = {
        median: Number.parseFloat(stats.median().toFixed(decimals)),
        mean: Number.parseFloat(stats.amean().toFixed(decimals)),
        mdev: Number.parseFloat(
          (stats.stddev() / Math.sqrt(stats.length)).toFixed(4)
        ), // "standard deviation of the mean"
        rsd:
          stats.stddev() > 0
            ? Number.parseFloat((100 * stats.stddev()) / stats.amean())
            : 0, // Relative standard deviation
        stddev: Number.parseFloat(stats.stddev().toFixed(decimals))
      };
      for (const p of percentiles) {
        let name = percentileName(p);
        results[name] = Number.parseFloat(
          stats.percentile(p).toFixed(decimals)
        );
      }
      return results;
    }

    function summarizeRecursive(target, keyPrefix, data) {
      if (data instanceof Stats) {
        setProperty(target, keyPrefix, summarize(data));
      } else if (typeof data === 'object') {
        for (const key of Object.keys(data)) {
          const path = [...keyPrefix, key];
          summarizeRecursive(target, path, data[key]);
        }
      } else {
        throw new TypeError(
          'Unhandled data type ' + typeof data + ' found when summarizing data'
        );
      }
    }

    const result = {};
    summarizeRecursive(result, [], this.data);
    return result;
  }
}
