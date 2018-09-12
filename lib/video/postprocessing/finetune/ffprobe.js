'use strict';

const execa = require('execa');
const log = require('intel').getLogger('browsertime.video');

module.exports = async function ffprobe(videoPath) {
  // Get the average saturation level of each frame
  const scriptArgs = [
    '-f',
    'lavfi',
    '-i',
    "movie='" + videoPath.replace('=', '\\=') + "',signalstats",
    '-show_entries',
    'frame_tags=lavfi.signalstats.SATLOW',
    '-v',
    'quiet',
    '-print_format',
    'json'
  ];

  log.verbose('Running ffprobe ' + scriptArgs.join(' '));

  const result = await execa('ffprobe', scriptArgs);
  return JSON.parse(result.stdout);
};
