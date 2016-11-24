'use strict';

const visualMetrics = require('./visualMetrics'),
  ffmpegRecorder = require('./ffmpegRecorder'),
  log = require('intel'),
  Promise = require('bluebird'),
  fs = require('fs'),
  path = require('path');

Promise.promisifyAll(fs);
const mkdirp = Promise.promisify(require('mkdirp'));

module.exports = {
  run(context) {
    const taskData = context.taskData;
    const imageDir = path.join(taskData.dataDir, 'images', '' + context.index);
    return ffmpegRecorder.stopRecording(taskData.ffmpeg)
      .tap(() => {
        delete taskData.ffmpeg;
      })
      .tap(() => mkdirp(imageDir))
      .then((recording) => {
        return visualMetrics.run(recording.filePath, imageDir)
          .then((metrics) => {
            log.debug('Collected metrics ' + JSON.stringify(metrics));
            context.results.visualMetrics = metrics;
          }).
          then(() => {
            if (context.options.experimental.removeVideo) {
              return fs.unlinkAsync(recording.filePath);
            }
          });
      })
  }
};
