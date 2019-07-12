'use strict';

const sharp = require('sharp');
const pathToFolder = require('../pathToFolder');
const path = require('path');

module.exports = {
  async savePng(name, data, url, storageManager, config, dir, options) {
    const buffer = await sharp(data)
      .png({ compressionLevel: config.png.compressionLevel })
      .resize(config.maxSize, config.maxSize)
      .resize({ fit: 'inside' })
      .toBuffer();
    return storageManager.writeData(
      `${name}.png`,
      buffer,
      path.join(pathToFolder(url, options), dir)
    );
  },

  async saveJpg(name, data, url, storageManager, config, dir, options) {
    const buffer = await sharp(data)
      .jpeg({ quality: config.jpg.quality })
      .resize(config.maxSize, config.maxSize)
      .resize({ fit: 'inside' })
      .toBuffer();
    storageManager.writeData(
      `${name}.jpg`,
      buffer,
      path.join(pathToFolder(url, options), dir)
    );
  }
};
