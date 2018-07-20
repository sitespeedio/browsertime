'use strict';

const { promisify } = require('util');
const path = require('path');
const fs = require('fs');
const filters = require('../../support/filters');

const readdir = promisify(fs.readdir);
const unlink = promisify(fs.unlink);

module.exports = async function removeVideo(videoDir) {
  const fileNames = await readdir(videoDir);
  const filePaths = fileNames
    .map(fileName => path.join(videoDir, fileName))
    .filter(filters.onlyFiles)
    .filter(filters.onlyWithExtension('.mp4'));

  for (const filePath of filePaths) {
    await unlink(filePath);
  }
};
