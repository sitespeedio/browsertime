'use strict';

const sharp = require('sharp');
const path = require('path');
const merge = require('lodash.merge');
const defaultConfig = require('./defaults');
const pathToFolder = require('../support/pathToFolder');

const SCREENSHOT_DIR = 'screenshots';

async function savePng(
  name,
  data,
  url,
  storageManager,
  config,
  alias,
  options
) {
  const buffer = await sharp(data)
    .png({ compressionLevel: config.png.compressionLevel })
    .resize(config.maxSize, config.maxSize)
    .resize({ fit: 'inside' })
    .toBuffer();
  return storageManager.writeData(
    `${name}.png`,
    buffer,
    path.join(pathToFolder(url, alias, options), SCREENSHOT_DIR)
  );
}

async function saveJpg(
  name,
  data,
  url,
  storageManager,
  config,
  alias,
  options
) {
  const buffer = await sharp(data)
    .jpeg({ quality: config.jpg.quality })
    .resize(config.maxSize, config.maxSize)
    .resize({ fit: 'inside' })
    .toBuffer();
  storageManager.writeData(
    `${name}.jpg`,
    buffer,
    path.join(pathToFolder(url, alias, options), SCREENSHOT_DIR)
  );
}

class ScreenshotManager {
  constructor(storageManager, options) {
    this.storageManager = storageManager;
    this.config = merge({}, defaultConfig, options.screenshotParams);
    this.options = options;
  }

  async save(name, data, url, alias) {
    if (this.config.type === 'png') {
      return savePng(
        name,
        data,
        url,
        this.storageManager,
        this.config,
        alias,
        this.options
      );
    } else {
      return saveJpg(
        name,
        data,
        url,
        this.storageManager,
        this.config,
        alias,
        this.options
      );
    }
  }
}

module.exports = ScreenshotManager;
