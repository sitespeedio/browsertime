'use strict';

const execa = require('execa');
const log = require('intel');

module.exports = async function ffprobe(videoPath) {

  let videoPathEntry = videoPath.replace('=', '\\=');
  if ( process.platform === "win32") {
	  videoPathEntry = videoPath.replace(/\\/g, '/').replace(':', '\\:');
  }
  // Get the average saturation level of each frame
  const scriptArgs = [
    '-f',
    'lavfi',
    '-i',
    "movie='" + videoPathEntry + "',signalstats",
    '-show_entries',
    'frame_tags=lavfi.signalstats.SATAVG',
    '-v',
    'quiet',
    '-print_format',
    'json'
  ];

  log.verbose('Running ffprobe ' + scriptArgs.join(' '));

  const result = await execa('ffprobe', scriptArgs);
  return JSON.parse(result.stdout);
};
