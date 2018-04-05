'use strict';

const sharp = require('sharp');
const merge = require('lodash.merge');
const defaultConfig = require('./defaults');

const SCREENSHOT_DIR = 'screenshots';

async function savePng(name, data, storageManager, config) {
  const buffer = await sharp(data)
    .png({ compressionLevel: config.png.compressionLevel })
    .resize(config.maxSize, config.maxSize)
    .max()
    .toBuffer();
  return storageManager.writeData(`${name}.png`, buffer, SCREENSHOT_DIR);
}

async function saveJpg(name, data, storageManager, config) {
  const buffer = await sharp(data)
    .jpeg({ quality: config.jpg.quality })
    .resize(config.maxSize, config.maxSize)
    .max()
    .toBuffer();
  storageManager.writeData(`${name}.jpg`, buffer, SCREENSHOT_DIR);
}

class ScreenshotManager {
  constructor(storageManager, options) {
    this.storageManager = storageManager;
    this.config = merge({}, defaultConfig, options.screenshotParams);
  }

  async save(name, data) {
    if (this.config.type === 'png') {
      return savePng(name, data, this.storageManager, this.config);
    } else {
      return saveJpg(name, data, this.storageManager, this.config);
    }
  }
}

module.exports = ScreenshotManager;
