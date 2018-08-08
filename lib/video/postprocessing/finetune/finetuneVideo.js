'use strict';

const ffprobe = require('./ffprobe');
const { promisify } = require('util');
const findFirstFrame = require('./findFirstFrame');
const fineTuneAndAddText = require('./fineTuneAndAddText');
const path = require('path');
const fs = require('fs');
const log = require('intel').getLogger('browsertime.video');
const get = require('lodash.get');
const videoDefaults = require('../../defaults');

const rename = promisify(fs.rename);

module.exports = async function(videoDir, videoPath, index, results, options) {
  const tmpFile = path.join(videoDir, 'tmp.mp4');
  const originalFile = path.join(videoDir, index + '-original.mp4');
  const ffProbeJson = await ffprobe(videoPath);
  const firstFrame = findFirstFrame(ffProbeJson);
  // the new start is the frame number divided by frames per second
  const newStart =
    firstFrame / get(options, 'videoParams.framerate', videoDefaults.framerate);
  log.verbose('FirstFrame: %s newStart: %s', firstFrame, newStart);
  await fineTuneAndAddText(videoPath, newStart, tmpFile, results, options);

  if (get(options, 'videoParams.keepOriginalVideo', false)) {
    await rename(videoPath, originalFile);
    await rename(tmpFile, videoPath);
  } else {
    await rename(tmpFile, videoPath);
  }
};
