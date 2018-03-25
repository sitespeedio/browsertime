'use strict';

const path = require('path');
const fs = require('fs');
const util = require('util');
const filters = require('../../support/filters');
const unlink = util.promisify(fs.unlink);

module.exports = async function(videoDir) {
  return fs
    .readdirAsync(videoDir)
    .map(fileName => path.join(videoDir, fileName))
    .filter(filters.onlyFiles)
    .map(filePath => unlink(filePath));
};
