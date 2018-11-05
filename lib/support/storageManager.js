'use strict';

const { promisify } = require('util');
const fs = require('fs');
const isEmpty = require('lodash.isempty');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');
const urlParser = require('url');
const dayjs = require('dayjs');

const writeFile = promisify(fs.writeFile);
const gzip = promisify(zlib.gzip);
const unlink = promisify(fs.unlink);
const mkdirp = promisify(require('mkdirp'));

const defaultDir = 'browsertime-results';
let timestamp = dayjs()
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
    await mkdirp(this.baseDir);
    return this.baseDir;
  }

  async createSubDataDir(...name) {
    const dir = path.join(this.baseDir, ...name);
    await mkdirp(dir);
    return dir;
  }

  async rm(filename) {
    return unlink(path.join(this.baseDir, filename));
  }

  async writeData(filename, data, subdir) {
    let dirPath;
    if (subdir) {
      dirPath = await this.createSubDataDir(subdir);
    } else {
      dirPath = await this.createDataDir();
    }

    return writeFile(path.join(dirPath, filename), data);
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
