'use strict';

const execa = require('execa');
const log = require('intel');

module.exports = async function convert(src, dest, crf) {
  const scriptArgs = [
    '-i',
    src,
    '-c:v',
    'libx264',
    '-crf',
    crf,
    '-preset',
    'medium',
    '-vf',
    'format=yuv420p',
    dest
  ];

  log.debug('Converting video to viewable format.');

  return execa('ffmpeg', scriptArgs);
};
