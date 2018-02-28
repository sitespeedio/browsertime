'use strict';

const sharp = require('sharp');
const merge = require('lodash.merge');
const defaultConfig = require('./defaults');

function savePng(name, data, storageManager, config) {
  return sharp(data)
    .png({ compressionLevel: config.png.compressionLevel })
    .resize(config.maxSize, config.maxSize)
    .max()
    .toBuffer()
    .then(newBuff => storageManager.writeData(`${name}.png`, newBuff));
}

function saveJpg(name, data, storageManager, config) {
  return sharp(data)
    .jpeg({ quality: config.jpg.quality })
    .resize(config.maxSize, config.maxSize)
    .max()
    .toBuffer()
    .then(newBuff => storageManager.writeData(`${name}.jpg`, newBuff));
}

class ScreenshotManager {
  constructor(storageManager, options) {
    this.storageManager = storageManager;
    this.config = merge({}, defaultConfig, options.screenshotParams);
  }

  save(name, data) {
    if (this.config.type === 'png') {
      return savePng(name, data, this.storageManager, this.config);
    } else {
      return saveJpg(name, data, this.storageManager, this.config);
    }
  }
}

module.exports = ScreenshotManager;
