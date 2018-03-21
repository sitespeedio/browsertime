'use strict';

const { promisify } = require('util');
const fs = require('fs');
const isEmpty = require('lodash.isempty');
const Promise = require('bluebird');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');
const urlParser = require('url');
const moment = require('moment');

const writeFile = promisify(fs.writeFile);
const gzip = promisify(zlib.gzip);
const mkdirp = promisify(require('mkdirp'));

const defaultDir = 'browsertime-results';
let timestamp = moment()
  .format()
  .replace(/:/g, '');

function pathNameFromUrl(url) {
  const parsedUrl = urlParser.parse(url),
    pathSegments = parsedUrl.pathname.split('/');

  pathSegments.unshift(parsedUrl.hostname);

  if (!isEmpty(parsedUrl.search)) {
    const md5 = crypto.createHash('md5'),
      hash = md5
        .update(parsedUrl.search)
        .digest('hex')
        .substring(0, 8);
    pathSegments.push('query-' + hash);
  }

  return pathSegments.filter(Boolean).join('-');
}

class StorageManager {
  constructor(url, { resultDir, prettyPrint = false } = {}) {
    if (resultDir) {
      this.baseDir = path.resolve(resultDir);
    } else {
      this.baseDir = path.resolve(defaultDir, pathNameFromUrl(url), timestamp);
    }
    this.jsonIndentation = prettyPrint ? 2 : 0;
  }

  async createDataDir() {
    return mkdirp(this.baseDir).then(() => this.baseDir);
  }

  async createSubDataDir(...name) {
    const dir = path.join(this.baseDir, ...name);
    return mkdirp(dir).then(() => dir);
  }

  async writeData(filename, data, subdir) {
    return Promise.join(
      subdir ? this.createSubDataDir(subdir) : this.createDataDir(),
      filename,
      data,
      (dirPath, filename, data) => writeFile(path.join(dirPath, filename), data)
    );
  }

  async writeJson(filename, json, shouldGzip) {
    if (shouldGzip) {
      const data = await gzip(Buffer.from(JSON.stringify(json)), { level: 1 });
      await this.writeData(`${filename}.gz`, data);
    } else {
      const data = JSON.stringify(json, null, this.jsonIndentation);
      await this.writeData(filename, data);
    }
  }

  get directory() {
    return this.baseDir;
  }
}

module.exports = StorageManager;
