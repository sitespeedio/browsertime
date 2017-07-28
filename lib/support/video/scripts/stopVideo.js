'use strict';

const ffmpegRecorder = require('../ffmpegRecorder');

module.exports = {
  run(context) {
    const taskData = context.taskData;
    context.log.debug('Stop ffmpeg recording');
    return ffmpegRecorder.stopRecording(taskData.ffmpeg).tap(recording => {
      delete taskData.ffmpeg;
      taskData.videoPaths = taskData.videoPaths || {};
      taskData.videoPaths['' + context.index] = recording.filePath;
    });
  }
};
