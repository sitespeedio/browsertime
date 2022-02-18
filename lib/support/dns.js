'use strict';

const execa = require('execa');

module.exports = async function () {
  if (process.platform === 'darwin') {
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
    await execa('sudo', ['service', 'dnsmasq', 'restart'], {
      reject: false
    });
    await execa('sudo', ['rndc', 'restart'], {
      reject: false
    });
    return execa('sudo', ['systemd-resolve', '--flush-caches'], {
      reject: false
    });
  }
};
