'use strict';

const pathToFolder = require('../pathToFolder');
const path = require('path');

let jimp;
try {
  jimp = require('jimp');
} catch (e) {
  jimp = null;
}

module.exports = {
  async savePngWithoutResize(name, data, url, storageManager, dir, options) {
    return storageManager.writeData(
      `${name}.png`,
      data,
      path.join(pathToFolder(url, options), dir)
    );
  },
  async savePng(name, data, url, storageManager, config, dir, options) {
    const buffer = await jimp.read(data).then(image => {
      return image
        .deflateLevel(config.png.compressionLevel)
        .scaleToFit(config.maxSize, config.maxSize)
        .getBufferAsync('image/png');
    });

    return storageManager.writeData(
      `${name}.png`,
      buffer,
      path.join(pathToFolder(url, options), dir)
    );
  },

  async saveJpg(name, data, url, storageManager, config, dir, options) {
    const buffer = await jimp.read(data).then(image => {
      return image
        .quality(config.jpg.quality)
        .scaleToFit(config.maxSize, config.maxSize)
        .getBufferAsync('image/jpeg');
    });
    return storageManager.writeData(
      `${name}.jpg`,
      buffer,
      path.join(pathToFolder(url, options), dir)
    );
  }
};
