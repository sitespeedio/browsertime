'use strict';

const visualMetrics = require('./visualMetrics'),
  ffmpegRecorder = require('./ffmpegRecorder'),
  log = require('intel'),
  path = require('path');

module.exports = {
  run(context) {
    const taskData = context.taskData;

    return ffmpegRecorder.stopRecording(taskData.ffmpeg)
      .tap(() => {
        delete taskData.ffmpeg;
      })
      .then((recording) => {
        return visualMetrics.run(recording.filePath, path.join(taskData.dataDir, 'images'))
          .then((metrics) => {
            log.debug('Collected metrics ' + JSON.stringify(metrics));
            context.results.visualMetrics = metrics;
          });
      });
  }
};
