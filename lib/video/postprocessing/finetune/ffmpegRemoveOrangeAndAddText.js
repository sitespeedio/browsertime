'use strict';

const execa = require('execa');
const log = require('intel');
const get = require('lodash.get');
const videoDefaults = require('../../defaults');

module.exports = function ffmpegRemoveOrangeAndAddText(
  videoPath,
  newStart,
  outputFile,
  metrics,
  options
) {
  let extras = '';
  // on Linux you don't need to set the fontfile
  const fontFile =
    process.platform === 'darwin' ? '/System/Library/Fonts/SFNSText.ttf:' : '';

  // we only add   SpeedIndex and other metrics if we run VisualMetrics
  if (options.speedIndex) {
    const speedIndex = `drawtext=${fontFile}enable='between(t,${Number(
      metrics.SpeedIndex
    ) /
      1000},30)':x=(w-tw)/2: y=H-124:fontcolor=white:fontsize=26:box=1:boxcolor=0x000000AA:text='SpeedIndex ${
      metrics.SpeedIndex
    }'`;

    const firstVisualChange = `drawtext=${fontFile}enable='between(t,${Number(
      metrics.FirstVisualChange
    ) /
      1000},30)':x=(w-tw)/2: y=H-180:fontcolor=white:fontsize=26:box=1:boxcolor=0x000000AA:text='FirstVisualChange ${
      metrics.FirstVisualChange
    }'`;

    const visualComplete85 = `drawtext=${fontFile}enable='between(t,${Number(
      metrics.VisualComplete85
    ) /
      1000},30)':x=(w-tw)/2: y=H-152:fontcolor=white:fontsize=26:box=1:boxcolor=0x000000AA:text='VisualComplete85 ${
      metrics.VisualComplete85
    }'`;

    const lastVisualChange = `drawtext=${fontFile}enable='between(t,${Number(
      metrics.LastVisualChange
    ) /
      1000},30)':x=(w-tw)/2: y=H-96:fontcolor=white:fontsize=26:box=1:boxcolor=0x000000AA:text='LastVisualChange ${
      metrics.LastVisualChange
    }'`;

    extras = `,${speedIndex}, ${lastVisualChange}, ${visualComplete85}, ${firstVisualChange}`;
  }

  const scriptArgs = ['-ss', newStart];
  if (options.speedIndex) {
    // End the video on last visual change + 1 s
    const end = newStart + metrics.LastVisualChange / 1000 + 1;
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
      `drawtext=${fontFile}timecode='00\\:00\\:00\\:00':rate=${
        options.videoParams.framerate
      }: x=(w-280)/2: y=H-60:fontcolor=white:fontsize=48:box=1:boxcolor=0x000000AA${extras}`
    );
  }

  scriptArgs.push('-y', outputFile);

  log.verbose('Running ffmpeg ' + scriptArgs.join(' '));

  return execa('ffmpeg', scriptArgs).then(result => result);
};
