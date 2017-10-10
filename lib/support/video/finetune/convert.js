'use strict';

const execa = require('execa'),
  path = require('path'),
  Promise = require('bluebird'),
  fs = require('fs');

Promise.promisifyAll(fs);

module.exports = {
  convert(context, videoFilePath) {
    const tmpFile = path.join(context.taskData.videoDir, 'tmp.mp4');
    const scriptArgs = [
      '-i',
      videoFilePath,
      '-c:v',
      'libx264',
      '-crf',
      context.options.videoParams.crf,
      '-preset',
      'medium',
      '-vf',
      'format=yuv420p',
      tmpFile
    ];

    context.log.debug('Converting video to viewable format.');

    return execa('ffmpeg', scriptArgs).then(() => {
      return fs.renameAsync(tmpFile, videoFilePath);
    });
  }
};
