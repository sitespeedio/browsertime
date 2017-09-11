'use strict';

const ffprobe = require('../finetune/ffprobe'),
  Promise = require('bluebird'),
  findFirstFrame = require('../finetune/findFirstFrame').get,
  ffmpegRemoveOrangeAndAddText = require('../finetune/ffmpegRemoveOrangeAndAddText')
    .run,
  path = require('path'),
  fs = require('fs'),
  log = require('intel');

Promise.promisifyAll(fs);

module.exports = {
  run(context) {
    const taskData = context.taskData;
    const videoFile = taskData.videoPaths['' + context.index];
    const tmpFile = path.join(taskData.videoDir, 'tmp.mp4');
    const originalFile = path.join(
      taskData.videoDir,
      context.index + '-original.mp4'
    );
    return ffprobe
      .run(videoFile)
      .then(ffProbeJson => {
        const firstFrame = findFirstFrame(ffProbeJson);
        // the new start is the frame number divided by frames per second
        const newStart = firstFrame / context.options.videoParams.framerate;
        log.verbose('FirstFrame: %s newStart: %s', firstFrame, newStart);
        return ffmpegRemoveOrangeAndAddText(
          videoFile,
          newStart,
          tmpFile,
          context.results.visualMetrics,
          context.options
        );
      })
      .then(() => {
        if (context.options.videoParams.keepOriginalVideo) {
          return fs
            .renameAsync(videoFile, originalFile)
            .then(() => fs.renameAsync(tmpFile, videoFile));
        } else {
          return fs.renameAsync(tmpFile, videoFile);
        }
      });
  }
};
