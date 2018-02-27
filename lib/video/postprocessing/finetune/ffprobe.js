'use strict';

const execa = require('execa');
const log = require('intel');

module.exports = function ffprobe(videoPath) {
  // Get the average saturation level of each frame
  const scriptArgs = [
    '-f',
    'lavfi',
    '-i',
    "movie='" + videoPath.replace('=', '\\=') + "',signalstats",
    '-show_entries',
    'frame_tags=lavfi.signalstats.SATAVG',
    '-v',
    'quiet',
    '-print_format',
    'json'
  ];

  log.verbose('Running ffprobe ' + scriptArgs.join(' '));

  return execa('ffprobe', scriptArgs)
    .then(result => result.stdout)
    .then(JSON.parse);
};
