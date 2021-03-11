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
        : { stdio: 'ignore' };

    this.gnirehtet = execa('gnirehtet', scriptArgs, extraArgs);
    // Wait so Gnirehtet can start
    return delay(4000);
  }
  async stop() {
    // Try to stop the client nicely
    await execa('gnirehtet', ['stop']);
    await delay(2000);
    // This should stop both desktop and client.
    await this.gnirehtet.kill('SIGINT', {
      forceKillAfterTimeout: 2000
    });
    return delay(2000);
  }
}
module.exports = Gnirehtet;
