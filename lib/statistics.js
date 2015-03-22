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

var Stats = require('fast-stats').Stats;

exports.setupTimingsStatistics = function(timings, metric) {
    if (metric.timings) {
        Object.keys(metric.timings).forEach(function(timing) {
            if (timings[timing]) {
                timings[timing].push(metric.timings[timing]);
            } else {
                timings[timing] = new Stats().push(metric.timings[timing]);
            }
        });
    }
};

exports.setupUserTimingsStatistics = function(timings, metric) {
    if (metric.userTimings && metric.userTimings.marks) {
        metric.userTimings.marks.forEach(function(mark) {
            if (timings[mark.name]) {
                timings[mark.name].push(mark.startTime);
            } else {
                timings[mark.name] = new Stats().push(mark.startTime);
            }
        });
    }
};

exports.setupStatistics = function(timings, metric, name) {
    if (metric[name]) {
        if (timings[name]) {
            timings[name].push(metric[name]);
        } else {
            timings[name] = new Stats().push(metric[name]);
        }
    }
};

exports.formatStatistics = function(timings) {
    var data = {};

    Object.keys(timings).forEach(function(timing) {
        var stats = timings[timing];
        var decimals = 0;
        data[timing] = {
          min: stats.percentile(0).toFixed(decimals),
          max: stats.percentile(100).toFixed(decimals),
          p10: stats.percentile(10).toFixed(decimals),
          p70: stats.percentile(70).toFixed(decimals),
          p80: stats.percentile(80).toFixed(decimals),
          p90: stats.percentile(90).toFixed(decimals),
          p99: stats.percentile(99).toFixed(decimals),
          median: stats.median().toFixed(decimals),
          mean: stats.amean().toFixed(decimals)
        };
    });

    return data;
};
