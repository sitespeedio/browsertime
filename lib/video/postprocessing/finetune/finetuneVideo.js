'use strict';

const ffprobe = require('./ffprobe');
const Promise = require('bluebird');
const findFirstFrame = require('./findFirstFrame');
const ffmpegRemoveOrangeAndAddText = require('./ffmpegRemoveOrangeAndAddText');
const path = require('path');
const fs = require('fs');
const log = require('intel');
const get = require('lodash.get');
const videoDefaults = require('../../defaults');

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
    return ffprobe(videoFile)
      .then(ffProbeJson => {
        const firstFrame = findFirstFrame(ffProbeJson);
        // the new start is the frame number divided by frames per second
        const newStart =
          firstFrame /
          get(
            context,
            'options.videoParams.framerate',
            videoDefaults.framerate
          );
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
        if (get(context, 'options.videoParams.keepOriginalVideo', false)) {
          return fs
            .renameAsync(videoFile, originalFile)
            .then(() => fs.renameAsync(tmpFile, videoFile));
        } else {
          return fs.renameAsync(tmpFile, videoFile);
        }
      });
  }
};
