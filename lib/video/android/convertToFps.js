'use strict';

const execa = require('execa'),
  path = require('path'),
  Promise = require('bluebird'),
  fs = require('fs'),
  get = require('lodash.get'),
  videoDefaults = require('../defaults');

Promise.promisifyAll(fs);

module.exports = {
  convert(context) {
    const tmpFile = path.join(context.taskData.videoDir, 'tmp.mp4');
    const videoFile = context.taskData.mpegPath;
    const scriptArgs = [
      '-i',
      videoFile,
      '-r',
      get(context, 'options.videoParams.framerate', videoDefaults.framerate),
      tmpFile
    ];
    context.log.info(
      'Converting video to %s fps',
      get(context, 'options.videoParams.framerate', videoDefaults.framerate)
    );
    return execa('ffmpeg', scriptArgs).then(() => {
      return fs.renameAsync(tmpFile, videoFile);
    });
  }
};
