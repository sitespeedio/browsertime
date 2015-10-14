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
  }
};
