import { execa } from 'execa';
import intel from 'intel';
const log = intel.getLogger('browsertime.video');

export async function convert(source, destination) {
  const scriptArguments = [
    //  '-framerate',
    //  60,
    '-i',
    source,
    '-c:v',
    'copy',
    '-f',
    'mp4',
    destination,
    '-y'
  ];

  log.debug('Converting video from h264 to mp4 %j', scriptArguments);

  return execa('ffmpeg', scriptArguments);
}
