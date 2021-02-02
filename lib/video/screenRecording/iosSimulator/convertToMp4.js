'use strict';

const execa = require('execa');
const log = require('intel').getLogger('browsertime.video');

module.exports = async function convert(src, dest) {
  const scriptArgs = [
    //  '-framerate',
    //  60,
    '-i',
    src,
    '-c:v',
    'copy',
    '-f',
    'mp4',
    dest,
    '-y'
  ];

  log.debug('Converting video from h264 to mp4 %j', scriptArgs);

  return execa('ffmpeg', scriptArgs);
};
