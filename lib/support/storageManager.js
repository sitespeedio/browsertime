'use strict';

const fs = require('fs'),
  Promise = require('bluebird'),
  path = require('path'),
  crypto = require('crypto'),
  urlParser = require('url'),
  moment = require('moment');

Promise.promisifyAll(fs);
const mkdirp = Promise.promisify(require('mkdirp'));

const defaultDir = 'browsertime-results';
let timestamp = moment().format().replace(/:/g, '');

function isEmpty(o) {
  if (o === null || o === undefined)
    return true;

  if (typeof o === 'object')
    return Object.keys(o).length === 0;

  if (typeof o === 'string')
    return o.length === 0;

  return false;
}

function folderNameForUrl(url) {
  const parsedUrl = urlParser.parse(url),
    pathSegments = parsedUrl.pathname.split('/');

  pathSegments.unshift(parsedUrl.hostname);

  if (!isEmpty(parsedUrl.search)) {
    const md5 = crypto.createHash('md5'),
      hash = md5.update(parsedUrl.search).digest('hex').substring(0, 8);
    pathSegments.push('query-' + hash);
  }

  return pathSegments.filter(Boolean).join('-');
}

class StorageManager {
  constructor(url, options) {
    this.baseDir = path.resolve(process.cwd(), options.resultBaseDir || defaultDir,
      folderNameForUrl(url), timestamp);
    this.jsonIndentation = options.prettyPrint ? 2 : 0;
  }

  createDataDir() {
    return mkdirp(this.baseDir)
      .then(() => this.baseDir);
  }

  writeData(filename, data) {
    return Promise.join(this.createDataDir(), filename, data,
      (dirPath, filename, data) =>
        fs.writeFileAsync(path.join(dirPath, filename), data));
  }

  writeJson(filename, json) {
    return this.writeData(filename, JSON.stringify(json, null, this.jsonIndentation));
  }

  get directory() {
    return this.baseDir;
  }
}

module.exports = StorageManager;
