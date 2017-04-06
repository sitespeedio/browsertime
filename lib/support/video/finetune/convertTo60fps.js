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
      '-i', videoFile,
      '-r', 60,
      tmpFile
    ];
    context.log.info('Converting video to 60 fps');
    return execa('ffmpeg', scriptArgs).then(() => {
      return fs.renameAsync(tmpFile, videoFile);
    });
  }
};
