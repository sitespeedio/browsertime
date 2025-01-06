import path from 'node:path';
import merge from 'lodash.merge';
import { getLogger } from '@sitespeed.io/log';
import { screenshotDefaults } from './defaults.js';
import {
  savePngWithoutResize,
  savePng,
  saveJpg
} from '../support/images/index.js';
import { loadCustomJimp } from './loadCustomJimp.js';

const SCREENSHOT_DIR = 'screenshots';
const log = getLogger('browsertime.screenshot');

export class ScreenshotManager {
  constructor(storageManager, options) {
    this.storageManager = storageManager;
    this.config = merge({}, screenshotDefaults, options.screenshotParams);
    this.options = options;
    this.savedScreenshots = [];
  }

  async save(name, data, url, index) {
    const jimp = await loadCustomJimp();

    if (!jimp) {
      if (this.config.type === 'jpg') {
        log.info(
          'Missing jimp dependency so you can only save images as png at viewport size'
        );
      }
      const pathAndName = await savePngWithoutResize(
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
      const pathAndName = await savePng(
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
      const pathAndName = await saveJpg(
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
