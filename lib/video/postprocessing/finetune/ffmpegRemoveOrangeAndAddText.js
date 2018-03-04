'use strict';

const execa = require('execa');
const log = require('intel');
const get = require('lodash.get');
const videoDefaults = require('../../defaults');
const getTimingMetrics = require('./addTimingMetrics');

module.exports = function ffmpegRemoveOrangeAndAddText(
  videoPath,
  newStart,
  outputFile,
  metrics,
  options
) {
  const timingMetrics = getTimingMetrics(metrics, options);
  const scriptArgs = ['-ss', newStart];
  if (options.visualMetrics) {
    // End the video on last visual change + 1 s
    const end = newStart + metrics.visualMetrics.LastVisualChange / 1000 + 1;
    scriptArgs.push('-t', end);
  }

  scriptArgs.push('-i', videoPath, '-c:v', 'libx264', '-an');

  // keeping old legacy videoRaw
  let showTimer = options.videoRaw ? false : videoDefaults.addTimer;
  if (
    !options.videoRaw &&
    get(options, 'videoParams.addTimer', undefined) != undefined
  ) {
    showTimer = options.videoParams.addTimer;
  }

  if (showTimer) {
    scriptArgs.push(
      '-vf',
      `drawtext=timecode='00\\:00\\:00\\:00':rate=${
        options.videoParams.framerate
      }: x=(w-280)/2: y=H-60:fontcolor=white:fontsize=48:box=1:boxcolor=0x000000AA${timingMetrics}`
    );
  }

  scriptArgs.push('-y', outputFile);

  log.verbose('Running ffmpeg ' + scriptArgs.join(' '));

  return execa('ffmpeg', scriptArgs).then(result => result);
};
