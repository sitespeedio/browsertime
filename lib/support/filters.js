'use strict';

const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');

Promise.promisifyAll(fs);

/**
 * Filters to use with Array.prototype.filter, e.g. ['/a/path', '/another/path'].filter(onlyFiles)
 */
module.exports = {
  onlyWithExtension: function(ext) {
    return function(filepath) {
      return path.extname(filepath) === ext;
    };
  },
  onlyFiles: function(filepath) {
    return fs.statAsync(filepath).then(stat => stat.isFile());
  },
  onlyDirectories: function(filepath) {
    return fs.statAsync(filepath).then(stat => stat.isDirectory());
  }
};
