'use strict';

const visualMetrics = require('./visualMetrics'),
  ffmpegRecorder = require('./ffmpegRecorder'),
  log = require('intel'),
  Promise = require('bluebird'),
  fs = require('fs'),
  ffprobe = require('./ffprobe'),
  findFirstFrame = require('./findFirstFrame').get,
  ffmpegCutAndTimer = require('./ffmpegCutAndTimer').run,
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
            context.results.visualMetrics = metrics;
          }).
          then(() => {
            if (context.options.experimental.removeVideo) {
              return fs.unlinkAsync(recording.filePath);
            } else {
              return ffprobe.run(recording.filePath).then((ffProbeJson) => {
                const firstFrame = findFirstFrame(ffProbeJson);
                const fps = 60;
                const outputFile = context.taskData.dataDir  + '/final.mp4';
                const newStart = firstFrame/fps;
                log.verbose('FirstFrame: %s newStart: %s', firstFrame, newStart);
                return ffmpegCutAndTimer(recording.filePath, newStart, '/Roboto-Black.ttf', outputFile);
              });
            }
          });
      })
  }
};
