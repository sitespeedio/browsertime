import path from 'node:path';
import { createHash } from 'node:crypto';
import { gunzip as _gunzip, gzip as _gzip, createGzip } from 'node:zlib';
import { parse } from 'node:url';
import { promisify } from 'node:util';
import {
  writeFile as _writeFile,
  readFile as _readFile,
  unlink as _unlink,
  mkdir as _mkdir,
  createReadStream,
  createWriteStream
} from 'node:fs';
import { getLogger } from '@sitespeed.io/log';
import { localTime, isEmpty } from './util.js';

const gunzip = promisify(_gunzip);
const writeFile = promisify(_writeFile);
const readFile = promisify(_readFile);
const gzip = promisify(_gzip);
const unlink = promisify(_unlink);
const mkdir = promisify(_mkdir);
const log = getLogger('browsertime');

const defaultDir = 'browsertime-results';
let timestamp = localTime().replaceAll(':', '');

function pathNameFromUrl(url) {
  const parsedUrl = parse(url),
    pathSegments = parsedUrl.pathname.split('/');

  pathSegments.unshift(parsedUrl.hostname);

  if (!isEmpty(parsedUrl.search)) {
    const md5 = createHash('md5'),
      hash = md5.update(parsedUrl.search).digest('hex').slice(0, 8);
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

export class StorageManager {
  constructor(url, { resultDir, prettyPrint = false } = {}) {
    this.baseDir = resultDir
      ? path.resolve(resultDir)
      : path.resolve(defaultDir, pathNameFromUrl(url), timestamp);
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
    dirPath = await (subdir
      ? this.createSubDataDir(subdir)
      : this.createDataDir());
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
      const data = JSON.stringify(json, undefined, this.jsonIndentation);
      return this.writeData(filename, data);
    }
  }

  async readData(filename, subdir) {
    let filepath;
    filepath = subdir
      ? path.join(this.baseDir, subdir, filename)
      : path.join(this.baseDir, filename);

    if (filename.endsWith('.gz')) {
      const readStream = createReadStream(filepath);
      const text = await streamToString(readStream);
      const unzipped = await gunzip(text);
      return unzipped.toString();
    } else {
      return readFile(filepath);
    }
  }

  async gzip(inputFile, outputFile, removeInput) {
    const promise = new Promise(function (resolve, reject) {
      const gzip = createGzip();
      const input = createReadStream(inputFile);
      const out = createWriteStream(outputFile);
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
