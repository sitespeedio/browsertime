'use strict';

const ffmpegRecorder = require('../ffmpegRecorder');
const convert = require('../finetune/convert').convert;

module.exports = {
  run(context) {
    let videoFilePath;
    const taskData = context.taskData;
    context.log.debug('Stop ffmpeg recording');
    return ffmpegRecorder
      .stopRecording(taskData.ffmpeg)
      .tap(recording => {
        videoFilePath = recording.filePath;
      })
      .then(() => convert(context, videoFilePath))
      .then(() => {
        delete taskData.ffmpeg;
        taskData.videoPaths = taskData.videoPaths || {};
        taskData.videoPaths['' + context.index] = videoFilePath;
      });
  }
};
