'use strict';

let fs = require('fs'),
  path = require('path'),
  Promise = require('bluebird');

Promise.promisifyAll(fs);

module.exports = {
  onlyWithExtension: function(ext) {
    return function(filepath) {
      return path.extname(filepath) === ext;
    };
  },
  onlyFiles: function(filepath) {
    return fs.statAsync(filepath)
      .then((stat) => stat.isFile());
  },
  onlyDirectories: function(filepath) {
    return fs.statAsync(filepath)
      .then((stat) => stat.isDirectory());
  },
  userTimingWhitelist: function(result, whitelistRegex) {
    const userTimingWhitelistRegex = new RegExp(whitelistRegex);
    let userTimingMarks = result.timings.userTimings.marks;
    result.timings.userTimings.marks = userTimingMarks.filter((mark) => {
      return userTimingWhitelistRegex.exec(mark.name) !== null;
    }, {});
    let userTimingMeasurements = result.timings.userTimings.measures;
    result.timings.userTimings.measures = userTimingMeasurements.filter((measure) => {
      return userTimingWhitelistRegex.exec(measure.name) !== null;
    }, {});

    return result;
  }
};
