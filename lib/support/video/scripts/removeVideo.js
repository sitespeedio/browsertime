'use strict';

const Promise = require('bluebird'),
  path = require('path'),
  fs = require('fs'),
  filters = require('../../filters');

Promise.promisifyAll(fs);

module.exports = {
  run(context) {
    const taskData = context.taskData;
    return fs
      .readdirAsync(taskData.videoDir)
      .map(fileName => path.join(taskData.videoDir, fileName))
      .filter(filters.onlyFiles)
      .map(filePath => fs.unlinkAsync(filePath));
  }
};
