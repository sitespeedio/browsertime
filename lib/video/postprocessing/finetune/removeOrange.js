import { execa } from 'execa';
import { getLogger } from '@sitespeed.io/log';
const log = getLogger('browsertime.video');

export async function removeOrange(
  inputFile,
  outputFile,
  newStart,
  visualMetrics,
  options
) {
  // Remove the orange frames from the video (and stop the video after last visual change)
  const arguments_ = ['-nostdin', '-ss', newStart, '-i', inputFile];
  if (options.visualMetrics) {
    // End the video on last visual change + 1 s
    const end = newStart + visualMetrics.LastVisualChange / 1000 + 1;
    arguments_.push('-to', end);
  }
  arguments_.push('-c', 'copy', outputFile);

  log.verbose('Removing orange start with FFMPEG ' + arguments_.join(' '));
  return execa('ffmpeg', arguments_);
}
