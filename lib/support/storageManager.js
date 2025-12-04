// storage-manager.js
import path from 'node:path';
import { createHash } from 'node:crypto';
import { gunzip as _gunzip, gzip as _gzip, createGzip } from 'node:zlib';
import { URL } from 'node:url';
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

function pathNameFromUrl(input) {
  // If it's a proper web URL → use WHATWG URL.
  // Otherwise treat it as a filesystem path and return only the basename.
  let asUrl;
  try {
    asUrl = new URL(input); // succeeds only for absolute URLs like https://..., file://..., etc.
  } catch {
    // Filesystem path case (e.g. "test.js", "my/path/to/test.js")
    // We want exactly "test.js" (no hostname, no parent dirs).
    let base = path.basename(path.normalize(input));
    // If someone passed a trailing slash directory, basename returns '' → keep it stable.
    if (!base)
      base = input.replaceAll('\\', '/').split('/').findLast(Boolean) ?? '';
    return base;
  }

  // URL case: mirror your previous behavior
  const decodedPathname = decodeURIComponent(asUrl.pathname);
  const pathSegments = decodedPathname.split('/');

  // Only add hostname for real web URLs (file: URLs typically have empty hostname on POSIX)
  if (asUrl.hostname) {
    pathSegments.unshift(asUrl.hostname);
  }

  if (!isEmpty(asUrl.search)) {
    const md5 = createHash('md5');
    const hash = md5.update(asUrl.search).digest('hex').slice(0, 8);
    pathSegments.push(`query-${hash}`);
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
    const dirPath = await (subdir
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
    const filepath = subdir
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
