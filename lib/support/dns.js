import { execa } from 'execa';
import intel from 'intel';
import { isAndroidConfigured } from '../android/index.js';
const log = intel.getLogger('browsertime.dns');

export default async function (options) {
  if (isAndroidConfigured(options)) {
    return;
  }

  if (options.safari && options.safari.ios) {
    return;
  }

  if (process.platform === 'darwin') {
    log.info('Flush DNS cache on MacOS');
    await execa('sudo', ['killall', '-HUP', 'mDNSResponder'], {
      reject: false
    });
    await execa('sudo', ['dscacheutil', '-flushcache'], {
      reject: false
    });
    return execa('sudo', ['lookupd', '-flushcache'], {
      reject: false
    });
  } else if (process.platform === 'linux') {
    log.info('Flush DNS cache on Linux');
    await execa('sudo', ['systemd-resolve', '--flush-caches'], {
      reject: false
    });
    await execa('sudo', ['service', 'dnsmasq', 'restart'], {
      reject: false
    });
    await execa('sudo', ['rndc', 'restart'], {
      reject: false
    });
  }
}
