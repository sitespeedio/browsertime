import { execa } from 'execa';
import { getLogger } from '@sitespeed.io/log';
const log = getLogger('browsertime.gnirehtet');
const delay = ms => new Promise(response => setTimeout(response, ms));

export class Gnirehtet {
  constructor(options) {
    this.options = options;
  }
  async start() {
    const scriptArguments = ['run'];
    const options = this.options;

    if (
      options.chrome &&
      options.chrome.android &&
      options.chrome.android.deviceSerial
    ) {
      scriptArguments.push(options.chrome.android.deviceSerial);
    } else if (
      options.firefox &&
      options.firefox.android &&
      options.firefox.android.deviceSerial
    ) {
      scriptArguments.push(options.firefox.android.deviceSerial);
    }

    log.info('Starting gnirehtet');
    const extraArguments =
      options.verbose >= 1
        ? {
            stdio: 'inherit',
            buffer: false
          }
        : { stdio: 'ignore' };

    this.gnirehtet = execa('gnirehtet', scriptArguments, extraArguments);
    // Wait so Gnirehtet can start
    return delay(4000);
  }
  async stop() {
    const options = this.options;
    const scriptArguments = ['stop'];
    if (
      options.chrome &&
      options.chrome.android &&
      options.chrome.android.deviceSerial
    ) {
      scriptArguments.push(this.options.chrome.android.deviceSerial);
    } else if (
      options.firefox &&
      options.firefox.android &&
      options.firefox.android.deviceSerial
    ) {
      scriptArguments.push(this.options.firefox.android.deviceSerial);
    }

    // Try to stop the client nicely
    await execa('gnirehtet', scriptArguments);
    await delay(2000);
    // This should stop both desktop and client.
    await this.gnirehtet.kill('SIGINT');
    return delay(2000);
  }
}
