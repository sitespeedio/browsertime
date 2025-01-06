import { execa } from 'execa';
import { getLogger } from '@sitespeed.io/log';
const log = getLogger('browsertime');

export async function stop(processName) {
  const scriptArguments = ['-9', processName];

  log.debug('Kill all processes ' + processName);

  return execa('pkill', scriptArguments, { reject: false });
}
