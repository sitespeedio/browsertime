'use strict';

const execa = require('execa');
const log = require('intel').getLogger('browsertime.video');

module.exports = async function convert(src, dest, crf, threads) {
  const scriptArgs = [
    '-nostdin',
    '-i',
    src,
    '-c:v',
    'libx264',
    '-threads',
    threads,
    '-crf',
    crf,
    '-preset',
    'fast',
    '-vf',
    'format=yuv420p',
    dest
  ];

  log.debug('Converting video to viewable format with args %j', scriptArgs);

  return execa('ffmpeg', scriptArgs);
};
