'use strict';
const merge = require('lodash.merge');
const defaultConfig = require('./defaults');
const path = require('path');
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

  async save(name, data, url, index) {
    if (!jimp) {
      if (this.config.type === 'jpg') {
        log.info(
          'Missing sharp dependency so you can only save images as png at viewport size'
        );
      }
      const pathAndName = await images.savePngWithoutResize(
        name,
        data,
        url,
        this.storageManager,
        path.join(SCREENSHOT_DIR, `${index}`),
        this.options
      );
      this.savedScreenshots.push(
        pathAndName.replace(this.storageManager.directory + '/', '')
      );
    }
    if (this.config.type === 'png') {
      const pathAndName = await images.savePng(
        name,
        data,
        url,
        this.storageManager,
        this.config,
        path.join(SCREENSHOT_DIR, `${index}`),
        this.options
      );
      this.savedScreenshots.push(
        pathAndName.replace(this.storageManager.directory + '/', '')
      );
    } else {
      const pathAndName = await images.saveJpg(
        name,
        data,
        url,
        this.storageManager,
        this.config,
        path.join(SCREENSHOT_DIR, `${index}`),
        this.options
      );
      this.savedScreenshots.push(
        pathAndName.replace(this.storageManager.directory + '/', '')
      );
    }
  }

  getSaved() {
    return this.savedScreenshots;
  }
}

module.exports = ScreenshotManager;
