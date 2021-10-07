'use strict';

const log = require('intel').getLogger('browsertime');
const fs = require('fs');
const isEmpty = require('lodash.isempty');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');
const urlParser = require('url');
const dayjs = require('dayjs');
const { promisify } = require('util');
const gunzip = promisify(zlib.gunzip);
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const gzip = promisify(zlib.gzip);
const unlink = promisify(fs.unlink);
const mkdir = promisify(fs.mkdir);

const defaultDir = 'browsertime-results';
let timestamp = dayjs().format().replace(/:/g, '');

function pathNameFromUrl(url) {
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

async function streamToString(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('error', reject);
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
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
    await mkdir(this.baseDir, { recursive: true });
    return this.baseDir;
  }

  async createSubDataDir(...name) {
    const dir = path.join(this.baseDir, ...name);
    await mkdir(dir, { recursive: true });
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
    const fullPath = path.join(dirPath, filename);
    return writeFile(fullPath, data).then(() => {
      return fullPath;
    });
  }

  async writeJson(filename, json, shouldGzip) {
    if (shouldGzip) {
      const data = await gzip(Buffer.from(JSON.stringify(json)), { level: 1 });
      return this.writeData(`${filename}.gz`, data);
    } else {
      const data = JSON.stringify(json, null, this.jsonIndentation);
      return this.writeData(filename, data);
    }
  }

  async readData(filename, subdir) {
    let filepath;
    if (subdir) {
      filepath = path.join(this.baseDir, subdir, filename);
    } else {
      filepath = path.join(this.baseDir, filename);
    }

    if (filename.endsWith('.gz')) {
      const readStream = fs.createReadStream(filepath);
      const text = await streamToString(readStream);
      const unzipped = await gunzip(text);
      return unzipped.toString();
    } else {
      return readFile(filepath);
    }
  }

  async gzip(inputFile, outputFile, removeInput) {
    const promise = new Promise(function (resolve, reject) {
      const gzip = zlib.createGzip();
      const input = fs.createReadStream(inputFile);
      const out = fs.createWriteStream(outputFile);
      out.on('finish', function () {
        if (removeInput) {
          unlink(inputFile).then(() => resolve());
        } else {
          resolve();
        }
      });
      out.on('error', function (e) {
        log.error('Could not gzip %s to %s', inputFile, outputFile, e);
        reject();
      });
      input.pipe(gzip).pipe(out);
    });
    return promise;
  }

  get directory() {
    return this.baseDir;
  }
}

module.exports = StorageManager;
