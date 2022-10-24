import execa from 'execa';
import intel from 'intel';
const log = intel.getLogger('browsertime.video');

export default async function (source, destination, framerate) {
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
