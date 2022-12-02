import { execa } from 'execa';
import intel from 'intel';
const log = intel.getLogger('browsertime');

export async function stop(processName) {
  const scriptArguments = ['-9', processName];

  log.debug('Kill all processes ' + processName);

  return execa('pkill', scriptArguments, { reject: false });
}
