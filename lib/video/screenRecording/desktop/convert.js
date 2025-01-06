import { execa } from 'execa';
import { getLogger } from '@sitespeed.io/log';
const log = getLogger('browsertime.video');

export async function convert(source, destination, crf, threads) {
  const scriptArguments = [
    '-nostdin',
    '-i',
    source,
    '-c:v',
    'libx264',
    '-threads',
    threads,
    '-crf',
    crf,
    '-preset',
    'fast',
    '-vf',
    'format=yuv420p',
    destination
  ];

  log.debug(
    'Converting video to viewable format with args %j',
    scriptArguments
  );

  return execa('ffmpeg', scriptArguments);
}
