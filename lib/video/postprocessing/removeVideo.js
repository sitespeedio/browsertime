'use strict';

const Promise = require('bluebird'),
  path = require('path'),
  fs = require('fs'),
  filters = require('../../support/filters');

Promise.promisifyAll(fs);

module.exports = async function(videoDir) {
  return fs
    .readdirAsync(videoDir)
    .map(fileName => path.join(videoDir, fileName))
    .filter(filters.onlyFiles)
    .map(filePath => fs.unlinkAsync(filePath));
};
