'use strict';

const execa = require('execa');
const Promise = require('bluebird');
const log = require('intel');
const fs = require('fs');

Promise.promisifyAll(fs);

module.exports = function convert(src, dest, framerate) {
  const scriptArgs = ['-i', src, '-r', framerate, dest];
  log.info('Converting video to %s fps', framerate);
  return execa('ffmpeg', scriptArgs);
};
