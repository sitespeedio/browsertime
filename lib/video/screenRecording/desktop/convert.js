'use strict';

const execa = require('execa');
const log = require('intel').getLogger('browsertime.video');

module.exports = async function convert(src, dest, crf) {
  const scriptArgs = [
    '-nostdin',
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

  log.debug('Converting video to viewable format with args %j', scriptArgs);

  return execa('ffmpeg', scriptArgs);
};
