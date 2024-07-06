import path from 'node:path';
import { pathToFolder } from '../pathToFolder.js';

export async function savePngWithoutResize(
  name,
  data,
  url,
  storageManager,
  dir,
  options
) {
  return storageManager.writeData(
    `${name}.png`,
    data,
    path.join(pathToFolder(url, options), dir)
  );
}
export async function savePng(
  name,
  data,
  url,
  storageManager,
  config,
  dir,
  options
) {
  let jimp;
  try {
    jimp = await import('jimp');
  } catch {
    jimp = undefined;
  }

  if (jimp) {
    const image = await jimp.default.read(data);
    const buffer = await image
      .deflateLevel(config.png.compressionLevel)
      .scaleToFit(config.maxSize, config.maxSize, jimp.default.RESIZE_HERMITE)
      .getBufferAsync('image/png');

    return storageManager.writeData(
      `${name}.png`,
      buffer,
      path.join(pathToFolder(url, options), dir)
    );
  }
}
export async function saveJpg(
  name,
  data,
  url,
  storageManager,
  config,
  dir,
  options
) {
  let jimp;
  try {
    jimp = await import('jimp');
  } catch {
    jimp = undefined;
  }
  if (jimp) {
    const image = await jimp.default.read(data);
    // https://github.com/sitespeedio/sitespeed.io/issues/3922
    const buffer = await image
      .quality(config.jpg.quality)
      .scaleToFit(config.maxSize, config.maxSize, jimp.default.RESIZE_HERMITE)
      .getBufferAsync('image/jpeg');
    return storageManager.writeData(
      `${name}.jpg`,
      buffer,
      path.join(pathToFolder(url, options), dir)
    );
  }
}
