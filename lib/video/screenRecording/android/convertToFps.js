'use strict';

const execa = require('execa');
const path = require('path');
const Promise = require('bluebird');
const log = require('intel');
const fs = require('fs');

Promise.promisifyAll(fs);

module.exports = function convert(videoFilePath, framerate) {
  const tmpFile = path.join(videoFilePath, '..', 'tmp.mp4');
  const scriptArgs = ['-i', videoFilePath, '-r', framerate, tmpFile];
  log.info('Converting video to %s fps', framerate);
  return execa('ffmpeg', scriptArgs).then(() =>
    fs.renameAsync(tmpFile, videoFilePath)
  );
};
