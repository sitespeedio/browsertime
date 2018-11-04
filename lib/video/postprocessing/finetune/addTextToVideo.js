'use strict';

const execa = require('execa');
const log = require('intel').getLogger('browsertime.video');
const getTimingMetrics = require('./getTimingMetrics');
module.exports = async function(inputFile, outputFile, metrics, options) {
  /** Add timer and metrics to the video */
  const args = ['-nostdin', '-i', inputFile, '-c:v', 'libx264'];
  const timingMetrics = getTimingMetrics(metrics, options);
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
    }: x=(w-280)/2: y=H-60:fontcolor=white:fontsize=48:box=1:boxcolor=0x000000AA${timingMetrics}`
  );
  args.push('-y', outputFile);
  log.verbose('Adding text with FFMPEG ' + args.join(' '));
  return execa('ffmpeg', args);
};
