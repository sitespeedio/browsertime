'use strict';

const execa = require('execa');
const log = require('intel').getLogger('browsertime.video');

module.exports = function (src, dest, framerate) {
  const scriptArgs = ['-nostdin', '-i', src, '-r', framerate, dest];
  log.info('Converting video to %s fps', framerate);
  return execa.sync('ffmpeg', scriptArgs);
};
