'use strict';

const get = require('lodash.get');
const log = require('intel');
const ffmpegRecorder = require('./ffmpegRecorder');
const convert = require('./convert');
const videoDefaults = require('../../defaults');

module.exports = function stop(context) {
  let videoFilePath;
  const taskData = context.taskData;
  log.debug('Stop ffmpeg recording');

  return ffmpegRecorder
    .stopRecording(taskData.ffmpeg)
    .tap(recording => {
      videoFilePath = recording.filePath;
    })
    .then(() => {
      const crf = get(context, 'options.videoParams.crf', videoDefaults.crf);
      return convert(videoFilePath, taskData.mpegPath, crf);
    })
    .then(() => {
      delete taskData.ffmpeg;
      taskData.videoPaths = taskData.videoPaths || {};
      taskData.videoPaths['' + context.index] = taskData.mpegPath;
    });
};
