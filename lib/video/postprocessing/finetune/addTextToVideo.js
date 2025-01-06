import { execa } from 'execa';
import { getLogger } from '@sitespeed.io/log';
import { getTimingMetrics } from './getTimingMetrics.js';
import { getFont } from './getFont.js';
import { isAndroidConfigured } from '../../../android/index.js';
const log = getLogger('browsertime.video');

function isSmallish(options) {
  return (
    (options.chrome &&
      options.chrome.mobileEmulation &&
      options.chrome.mobileEmulation.deviceName) ||
    isAndroidConfigured(options)
  );
}

export async function addTextToVideo(
  inputFile,
  outputFile,
  videoMetrics,
  timingMetrics,
  options
) {
  /** Add timer and metrics to the video */
  const arguments_ = ['-nostdin', '-i', inputFile, '-c:v', 'libx264'];
  const allTimingMetrics = getTimingMetrics(
    videoMetrics,
    timingMetrics,
    options
  );
  const fontFile = getFont(options);

  let fontSize = 16;
  if (isSmallish(options)) {
    fontSize = 22;
  }

  if (options.safari && options.safari.useSimulator) {
    fontSize = 32;
  }

  arguments_.push(
    '-vf',
    `drawtext=${fontFile}x=w/2-(tw/2): y=H-h/10:fontcolor=white:fontsize=h/${fontSize}:box=1:boxcolor=0x000000AA:text='%{pts\\:hms}'${allTimingMetrics}`,
    '-y',
    outputFile
  );
  log.verbose('Adding text with FFMPEG ' + arguments_.join(' '));
  return execa('ffmpeg', arguments_);
}
