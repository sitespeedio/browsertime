'use strict';

const fs = require('fs'),
  isEmpty = require('lodash.isempty'),
  Promise = require('bluebird'),
  path = require('path'),
  crypto = require('crypto'),
  urlParser = require('url'),
  moment = require('moment');

Promise.promisifyAll(fs);
const mkdirp = Promise.promisify(require('mkdirp'));

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

  createDataDir() {
    return mkdirp(this.baseDir).then(() => this.baseDir);
  }

  createSubDataDir(...name) {
    const dir = path.join(this.baseDir, ...name);
    return mkdirp(dir).then(() => dir);
  }

  writeData(filename, data) {
    return Promise.join(
      this.createDataDir(),
      filename,
      data,
      (dirPath, filename, data) =>
        fs.writeFileAsync(path.join(dirPath, filename), data)
    );
  }

  writeJson(filename, json) {
    return this.writeData(
      filename,
      JSON.stringify(json, null, this.jsonIndentation)
    );
  }

  get directory() {
    return this.baseDir;
  }
}

module.exports = StorageManager;
