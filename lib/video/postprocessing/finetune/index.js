'use strict';

const log = require('intel').getLogger('browsertime.video');
const addTextToVideo = require('./addTextToVideo');
const removeOrange = require('./removeOrange');
const convert = require('./convertFps');
const path = require('path');
const fs = require('fs');
const get = require('lodash.get');
const { promisify } = require('util');
const rename = promisify(fs.rename);
const copyFile = promisify(fs.copyFile);
const unlink = promisify(fs.unlink);
const defaults = require('../../defaults');

module.exports = async function (
  videoDir,
  videoPath,
  index,
  videoMetrics,
  timingMetrics,
  options
) {
  const newStart = videoMetrics.videoRecordingStart / 1000;
  let tmpFile = path.join(videoDir, 'tmp.mp4');

  if (get(options, 'videoParams.keepOriginalVideo', false)) {
    const originalFile = path.join(videoDir, index + '-original.mp4');
    await copyFile(videoPath, originalFile);
  }

  // if there's no orange (too slow instance like travis?)
  // we don't wanna cut
  if (videoMetrics.videoRecordingStart > 0) {
    await removeOrange(
      videoPath,
      tmpFile,
      newStart,
      videoMetrics.visualMetrics,
      options
    );
  } else {
    if (videoMetrics.FirstVisualChange === 0) {
      // There are cases where the First Visual Change is zero, I don't know why so
      // at least log so we can keep track of it
      log.error(
        'The First Visual Change is zero, either no orange is there in the video or VisualMetrics failed: %j',
        videoMetrics
      );
    }
    tmpFile = videoPath;
  }

  if (
    options.android &&
    get(options, 'videoParams.convert', defaults.convert)
  ) {
    const tmpFile2 = path.join(videoDir, 'tmp-60fps.mp4');
    await convert(tmpFile, tmpFile2, 60);
    await unlink(tmpFile);
    await rename(tmpFile2, tmpFile);
  } else if (options.safari && options.safari.useSimulator) {
    const tmpFile2 = path.join(videoDir, 'tmp-60fps.mp4');
    await convert(tmpFile, tmpFile2, 60);
    await unlink(tmpFile);
    await rename(tmpFile2, tmpFile);
  }

  if (options.videoParams.addTimer) {
    const tmpFile2 = path.join(videoDir, 'tmp2.mp4');
    await addTextToVideo(
      tmpFile,
      tmpFile2,
      videoMetrics,
      timingMetrics,
      options
    );
    await rename(tmpFile2, videoPath);
    await unlink(tmpFile);
  } else {
    await rename(tmpFile, videoPath);
  }
};
