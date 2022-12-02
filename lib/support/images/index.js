import { join } from 'node:path';
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
    join(pathToFolder(url, options), dir)
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
    const buffer = await jimp.default.read(data).then(image => {
      return image
        .deflateLevel(config.png.compressionLevel)
        .scaleToFit(config.maxSize, config.maxSize)
        .getBufferAsync('image/png');
    });

    return storageManager.writeData(
      `${name}.png`,
      buffer,
      join(pathToFolder(url, options), dir)
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
    const buffer = await jimp.default.read(data).then(image => {
      return image
        .quality(config.jpg.quality)
        .scaleToFit(config.maxSize, config.maxSize)
        .getBufferAsync('image/jpeg');
    });
    return storageManager.writeData(
      `${name}.jpg`,
      buffer,
      join(pathToFolder(url, options), dir)
    );
  }
}
