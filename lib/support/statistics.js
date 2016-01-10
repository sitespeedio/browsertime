/**
 * Browsertime (http://www.browsertime.net)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */

/*
 * Utility functions for managing statistics of collected metrics and timings.
 */
'use strict';

let Stats = require('fast-stats').Stats;

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
  add(key, value) {
    validateType(key, 'string', 'key (' + key + ') must be a string');
    validateType(value, 'number', 'value (' + value + ') must be a number');
    if (!isFinite(value)) {
      throw new RangeError('value can\'t be infinite');
    }

    let stats = this[key] || new Stats();
    this[key] = stats.push(value);
  }

  addAll(data) {
    let samples = Array.isArray(data) ? data : [data];

    samples.forEach(function(sample) {
      Object.keys(sample).forEach(function(key) {
        let value = sample[key];
        // TODO check type of value, to see if it should be included. Possibly via optional transform function
        this.add(key, value);
      }, this);
    }, this);

    return this;
  }

  summarize(options) {
    options = options || {};
    let percentiles = options.percentiles || [0, 10, 70, 80, 90, 99, 100];
    let decimals = options.decimals || 0;
    let data = {};

    Object.keys(this).forEach((key) => {
      let stats = this[key];
      data[key] = {
        median: stats.median().toFixed(decimals),
        mean: stats.amean().toFixed(decimals)
      };
      percentiles.forEach(function(p) {
        let name = percentileName(p);
        data[key][name] = stats.percentile(p).toFixed(decimals);
      });
    });

    return data;
  }
}

module.exports = {
  Statistics: Statistics,

  setupTimingsStatistics: function(timings, metric) {
    if (metric.timings) {
      Object.keys(metric.timings).forEach(function(timing) {
        timings[timing] = timings[timing] || new Stats();
        timings[timing].push(metric.timings[timing]);
      });
    }
  },

  setupUserTimingsStatistics: function(timings, metric) {
    if (metric.userTimings && metric.userTimings.marks) {
      metric.userTimings.marks.forEach(function(mark) {
        timings[mark.name] = timings[mark.name] || new Stats();
        timings[mark.name].push(mark.startTime);
      });
    }
  },

  setupStatistics: function(timings, metric, name) {
    if (metric[name]) {
      if (timings[name]) {
        timings[name].push(metric[name]);
      } else {
        timings[name] = new Stats().push(metric[name]);
      }
    }
  }
};
