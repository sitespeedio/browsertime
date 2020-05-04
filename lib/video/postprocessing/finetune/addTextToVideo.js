'use strict';

const execa = require('execa');
const log = require('intel').getLogger('browsertime.video');
const getTimingMetrics = require('./getTimingMetrics');
const getFont = require('./getFont');

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
  const fontFile = getFont(options);
  args.push(
    '-vf',
    `drawtext=${fontFile}x=w/2-(tw/2): y=H-h/10:fontcolor=white:fontsize=h/16:box=1:boxcolor=0x000000AA:text='%{pts\\:hms}'${allTimingMetrics}`
  );
  args.push('-y', outputFile);
  log.verbose('Adding text with FFMPEG ' + args.join(' '));
  return execa('ffmpeg', args);
};
