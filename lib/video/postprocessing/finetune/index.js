'use strict';

const { promisify } = require('util');
const addTextToVideo = require('./addTextToVideo');
const removeOrange = require('./removeOrange');
const path = require('path');
const fs = require('fs');
const get = require('lodash.get');
const rename = promisify(fs.rename);
const unlink = promisify(fs.unlink);

module.exports = async function(
  videoDir,
  videoPath,
  index,
  results,
  videoStartInMs,
  options
) {
  const newStart = videoStartInMs / 1000;
  const tmpFile = path.join(videoDir, 'tmp.mp4');
  await removeOrange(videoPath, tmpFile, newStart, results, options);

  if (get(options, 'videoParams.keepOriginalVideo', false)) {
    const originalFile = path.join(videoDir, index + '-original.mp4');
    await rename(videoPath, originalFile);
  }

  if (options.videoParams.addTimer) {
    const tmpFile2 = path.join(videoDir, 'tmp2.mp4');
    await addTextToVideo(tmpFile, tmpFile2, results, options);
    await rename(tmpFile2, videoPath);
    await unlink(tmpFile);
  } else {
    await rename(tmpFile, videoPath);
  }
};
