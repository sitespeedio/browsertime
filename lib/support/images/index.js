import path from 'node:path';
import { pathToFolder } from '../pathToFolder.js';
import { loadCustomJimp } from '../../screenshot/loadCustomJimp.js';
import { getLogger } from '@sitespeed.io/log';
const log = getLogger('browsertime');

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
  const jimp = await loadCustomJimp();

  if (jimp) {
    const image = await jimp.read(data);
    const buffer = await image
      .deflateLevel(config.png.compressionLevel)
      .scaleToFit(config.maxSize, config.maxSize, jimp.RESIZE_HERMITE)
      .getBufferAsync('image/png');

    return storageManager.writeData(
      `${name}.png`,
      buffer,
      path.join(pathToFolder(url, options), dir)
    );
  } else {
    log.info(
      'Missing Jimp dependency so you can only save images as png at viewport size'
    );
    return savePngWithoutResize(name, data, url, storageManager, dir, options);
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
  const jimp = await loadCustomJimp();

  if (jimp) {
    const image = await jimp.read(data);
    // https://github.com/sitespeedio/sitespeed.io/issues/3922
    const buffer = await image
      .quality(config.jpg.quality)
      .scaleToFit(config.maxSize, config.maxSize, jimp.RESIZE_HERMITE)
      .getBufferAsync('image/jpeg');
    return storageManager.writeData(
      `${name}.jpg`,
      buffer,
      path.join(pathToFolder(url, options), dir)
    );
  } else {
    log.info(
      'Missing Jimp dependency so you can only save images as png at viewport size'
    );
    return savePngWithoutResize(name, data, url, storageManager, dir, options);
  }
}
