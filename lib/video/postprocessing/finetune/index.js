'use strict';

const { promisify } = require('util');
const addTextToVideo = require('./addTextToVideo');
const removeOrange = require('./removeOrange');
const path = require('path');
const fs = require('fs');
const get = require('lodash.get');
const rename = promisify(fs.rename);
const unlink = promisify(fs.unlink);
const log = require('intel').getLogger('browsertime.video');

module.exports = async function(
  videoDir,
  videoPath,
  index,
  videoMetrics,
  timingMetrics,
  options
) {
  const newStart = videoMetrics.videoRecordingStart / 1000;
  let tmpFile = path.join(videoDir, 'tmp.mp4');

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
    log.error(
      'The video recording start is zero, either no orange is there in the video or VisualMetrics failed.'
    );
    tmpFile = videoPath;
  }

  if (get(options, 'videoParams.keepOriginalVideo', false)) {
    const originalFile = path.join(videoDir, index + '-original.mp4');
    await rename(videoPath, originalFile);
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
