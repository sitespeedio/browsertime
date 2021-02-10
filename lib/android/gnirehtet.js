'use strict';

const execa = require('execa');
const log = require('intel').getLogger('browsertime.gnirehtet');
const delay = ms => new Promise(res => setTimeout(res, ms));

class Gnirehtet {
  constructor(options) {
    this.options = options;
  }
  async start(options) {
    const scriptArgs = ['run'];

    if (
      options.chrome &&
      options.chrome.android &&
      options.chrome.android.deviceSerial
    ) {
      scriptArgs.push(options.chrome.android.deviceSerial);
    } else if (
      options.firefox &&
      options.firefox.android &&
      options.firefox.android.deviceSerial
    ) {
      scriptArgs.push(options.firefox.android.deviceSerial);
    }

    log.info('Starting gnirehtet');
    const extraArgs =
      options.verbose >= 1
        ? {
            stdio: 'inherit',
            buffer: false
          }
        : {};

    this.gnirehtet = execa('gnirehtet', scriptArgs, extraArgs);
    return delay(2000);
  }
  async stop() {
    return this.gnirehtet.kill('SIGINT', {
      forceKillAfterTimeout: 2000
    });
  }
}
module.exports = Gnirehtet;
