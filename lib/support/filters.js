'use strict';

const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

const stat = promisify(fs.stat);

/**
 * Filters to use with Array.prototype.filter, e.g. ['/a/path', '/another/path'].filter(onlyFiles)
 */
module.exports = {
  onlyWithExtension(ext) {
    return filepath => path.extname(filepath) === ext;
  },
  async onlyFiles(filepath) {
    const stats = await stat(filepath);
    return stats.isFile();
  },
  async onlyDirectories(filepath) {
    const stats = await stat(filepath);
    return stats.isDirectory();
  }
};
