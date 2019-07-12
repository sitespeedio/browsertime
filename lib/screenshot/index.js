'use strict';

const merge = require('lodash.merge');
const defaultConfig = require('./defaults');
const SCREENSHOT_DIR = 'screenshots';
const images = require('../support/images');
class ScreenshotManager {
  constructor(storageManager, options) {
    this.storageManager = storageManager;
    this.config = merge({}, defaultConfig, options.screenshotParams);
    this.options = options;
  }

  async save(name, data, url) {
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
}

module.exports = ScreenshotManager;
