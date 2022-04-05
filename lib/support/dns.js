'use strict';

const execa = require('execa');
const log = require('intel').getLogger('browsertime.dns');
const { isAndroidConfigured } = require('../android');

module.exports = async function (options) {
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
};
