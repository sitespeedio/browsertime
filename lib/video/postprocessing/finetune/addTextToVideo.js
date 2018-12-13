'use strict';

const execa = require('execa');
const log = require('intel').getLogger('browsertime.video');
const getTimingMetrics = require('./getTimingMetrics');
module.exports = async function(
  inputFile,
  outputFile,
  videoMetrics,
  timingMetrics,
  options
) {
  /** Add timer and metrics to the video */
  const args = ['-nostdin', '-i', inputFile, '-c:v', 'libx264'];
  const allTimingMetrics = getTimingMetrics(
    videoMetrics,
    timingMetrics,
    options
  );
  const fontFile =
    process.platform === 'darwin'
      ? '/System/Library/Fonts/SFNSText.ttf:'
      : options.videoParams.fontPath
        ? options.videoParams.fontPath + ':'
        : '';
  args.push(
    '-vf',
    `drawtext=${fontFile}timecode='00\\:00\\:00\\:00':rate=${
      options.videoParams.framerate
    }: x=(w-tw)/2: y=H-h/8:fontcolor=white:fontsize=h/10:box=1:boxcolor=0x000000AA${allTimingMetrics}`
  );
  args.push('-y', outputFile);
  log.verbose('Adding text with FFMPEG ' + args.join(' '));
  return execa('ffmpeg', args);
};
