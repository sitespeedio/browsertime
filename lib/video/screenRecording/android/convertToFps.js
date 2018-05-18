'use strict';

const execa = require('execa');
const log = require('intel');

module.exports = async function(src, dest, framerate) {
  const scriptArgs = ['-nostdin', '-i', src, '-r', framerate, dest];
  log.info('Converting video to %s fps', framerate);
  return execa('ffmpeg', scriptArgs);
};
