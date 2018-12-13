'use strict';

const execa = require('execa');
const log = require('intel').getLogger('browsertime.video');

module.exports = async function(
  inputFile,
  outputFile,
  newStart,
  visualMetrics,
  options
) {
  // Remove the orange frames from the video (and stop the video after last visual change)
  const args = ['-nostdin', '-ss', newStart, '-i', inputFile];
  if (options.visualMetrics) {
    // End the video on last visual change + 1 s
    const end = newStart + visualMetrics.LastVisualChange / 1000 + 1;
    args.push('-to', end);
  }
  args.push('-c', 'copy', outputFile);

  log.verbose('Removing orange start with FFMPEG ' + args.join(' '));
  return execa('ffmpeg', args);
};
