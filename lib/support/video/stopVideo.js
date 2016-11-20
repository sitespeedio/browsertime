'use strict';

const visualMetrics = require('./visualMetrics'),
  ffmpegRecorder = require('./ffmpegRecorder'),
  log = require('intel'),
  Promise = require('bluebird'),
  fs = require('fs'),
  path = require('path');

Promise.promisifyAll(fs);

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
          }).
          then(() => {
            if (context.options.experimental.removeVideo) {
              return fs.unlinkAsync(recording.filePath);
            } else {
              return Promise.resolve();
            }
          });
      })
  }
};
