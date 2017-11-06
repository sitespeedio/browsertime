'use strict';

const execa = require('execa'),
  path = require('path'),
  Promise = require('bluebird'),
  fs = require('fs');

Promise.promisifyAll(fs);

module.exports = {
  convert(context) {
    const tmpFile = path.join(context.taskData.videoDir, 'tmp.mp4');
    const videoFile = context.taskData.mpegPath;
    const scriptArgs = [
      '-i',
      videoFile,
      '-r',
      context.options.videoParams.framerate || 30,
      tmpFile
    ];
    context.log.info(
      'Converting video to %s fps',
      context.options.videoParams.framerate || 30
    );
    return execa('ffmpeg', scriptArgs).then(() => {
      return fs.renameAsync(tmpFile, videoFile);
    });
  }
};
