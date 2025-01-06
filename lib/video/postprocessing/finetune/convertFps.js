import { execa } from 'execa';
import { getLogger } from '@sitespeed.io/log';
const log = getLogger('browsertime.video');

export async function convert(source, destination, framerate) {
  const scriptArguments = [
    '-nostdin',
    '-i',
    source,
    '-r',
    framerate,
    destination
  ];
  log.info('Converting video to %s fps', framerate);
  return execa('ffmpeg', scriptArguments);
}
