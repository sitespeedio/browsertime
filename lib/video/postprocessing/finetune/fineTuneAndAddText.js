'use strict';

const execa = require('execa');
const log = require('intel').getLogger('browsertime.video');
const getTimingMetrics = require('./addTimingMetrics');

module.exports = async function fineTuneAndAddText(
  videoPath,
  newStart,
  outputFile,
  metrics,
  options
) {
  const timingMetrics = getTimingMetrics(metrics, options);
  const scriptArgs = ['-nostdin', '-ss', newStart];
  if (options.visualMetrics) {
    // End the video on last visual change + 1 s
    const end = newStart + metrics.visualMetrics.LastVisualChange / 1000 + 1;
    scriptArgs.push('-t', end);
  }

  scriptArgs.push('-i', videoPath, '-c:v', 'libx264', '-an');

  if (options.videoParams.addTimer) {
    const fontFile =
      process.platform === 'darwin'
        ? '/System/Library/Fonts/SFNSText.ttf:'
        : options.videoParams.fontPath
          ? options.videoParams.fontPath + ':'
          : '';
    scriptArgs.push(
      '-vf',
      `drawtext=${fontFile}timecode='00\\:00\\:00\\:00':rate=${
        options.videoParams.framerate
      }: x=(w-280)/2: y=H-60:fontcolor=white:fontsize=48:box=1:boxcolor=0x000000AA${timingMetrics}`
    );
  }

  scriptArgs.push('-y', outputFile);

  log.verbose('Running ffmpeg ' + scriptArgs.join(' '));

  return execa('ffmpeg', scriptArgs);
};
