'use strict';

const execa = require('execa');
const path = require('path');
const Promise = require('bluebird');
const log = require('intel');
const fs = require('fs');

Promise.promisifyAll(fs);

module.exports = function convert(videoFilePath, crf) {
  const tmpFile = path.join(videoFilePath, '..', 'tmp.mp4');
  const scriptArgs = [
    '-i',
    videoFilePath,
    '-c:v',
    'libx264',
    '-crf',
    crf,
    '-preset',
    'medium',
    '-vf',
    'format=yuv420p',
    tmpFile
  ];

  log.debug('Converting video to viewable format.');

  return execa('ffmpeg', scriptArgs).then(() =>
    fs.renameAsync(tmpFile, videoFilePath)
  );
};
