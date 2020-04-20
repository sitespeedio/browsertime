'use strict';
const merge = require('lodash.merge');
const defaultConfig = require('./defaults');
const SCREENSHOT_DIR = 'screenshots';
const images = require('../support/images');
const log = require('intel').getLogger('browsertime.screenshot');

let jimp;
try {
  jimp = require('jimp');
} catch (e) {
  jimp = null;
}

class ScreenshotManager {
  constructor(storageManager, options) {
    this.storageManager = storageManager;
    this.config = merge({}, defaultConfig, options.screenshotParams);
    this.options = options;
    this.savedScreenshots = [];
  }

  async save(name, data, url) {
    this.savedScreenshots.push(name);
    if (!jimp) {
      if (this.config.type === 'jpg') {
        log.info(
          'Missing sharp dependency so you can only save images as png at viewport size'
        );
      }
      return images.savePngWithoutResize(
        name,
        data,
        url,
        this.storageManager,
        SCREENSHOT_DIR,
        this.options
      );
    }
    if (this.config.type === 'png') {
      return images.savePng(
        name,
        data,
        url,
        this.storageManager,
        this.config,
        SCREENSHOT_DIR,
        this.options
      );
    } else {
      return images.saveJpg(
        name,
        data,
        url,
        this.storageManager,
        this.config,
        SCREENSHOT_DIR,
        this.options
      );
    }
  }

  getSaved() {
    return this.savedScreenshots;
  }
}

module.exports = ScreenshotManager;
