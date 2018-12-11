'use strict';
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const lstat = promisify(fs.lstat);
const unlink = promisify(fs.unlink);
const rmdir = promisify(fs.rmdir);
const rename = promisify(fs.rename);
const filters = require('./filters');
const log = require('intel').getLogger('browsertime');

module.exports = {
  async rename(old, newName) {
    return rename(old, newName);
  },
  async removeFile(fileName) {
    return unlink(fileName);
  },
  async removeDirAndFiles(dirName) {
    const removeDir = async dir => {
      try {
        const files = await readdir(dir);
        await Promise.all(
          files.map(async file => {
            try {
              const p = path.join(dir, file);
              const stat = await lstat(p);
              if (stat.isDirectory()) {
                await removeDir(p);
              } else {
                await unlink(p);
              }
            } catch (err) {
              log.error('Could not remove file:' + file, err);
            }
          })
        );
        await rmdir(dir);
      } catch (err) {
        log.error('Could not remove dir:' + dir, err);
      }
    };
    return removeDir(dirName);
  },
  async removeByType(dir, type) {
    const fileNames = await readdir(dir);
    const filePaths = fileNames
      .map(fileName => path.join(dir, fileName))
      .filter(filters.onlyFiles)
      .filter(filters.onlyWithExtension('.' + type));

    for (const filePath of filePaths) {
      await unlink(filePath);
    }
  }
};
