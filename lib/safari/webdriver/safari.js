// const log = require('intel').getLogger('browsertime.safari');
import { execaCommand as command } from 'execa';
const delay = ms => new Promise(res => setTimeout(res, ms));

export class Safari {
  constructor(storageManager, options) {
    this.options = options;
    this.safariOptions = options.safari || {};
  }

  /**
   * Before the browser is started.
   */
  async beforeBrowserStart() {
    if (this.safariOptions.ios) {
      this.driverProcess = command(
        'safaridriver -p ' + this.options.safariDriverPort,
        {
          shell: true
        }
      );
      return delay(2000);
    }
  }

  /**
   * The browser is up and running, now its time to start to
   * configure what you need.
   */
  async afterBrowserStart() {}

  /**
   * Before the first iteration of your tests start.
   */
  async beforeStartIteration() {}

  /**
   * Before each URL/test runs.
   */
  async beforeEachURL() {}

  /**
   * When the page has finsihed loading, this functions runs (before
   * collecting metrics etc). This is the place to get you HAR file,
   * stop trace logging, stop measuring etc.
   *
   */
  async afterPageCompleteCheck(runner) {
    const resources = await runner.runScript(
      'return performance.getEntriesByType("resource");',
      'RESOURCE_TIMINGS'
    );

    return {
      browserScripts: {
        timings: {
          resourceTimings: resources
        }
      }
    };
  }

  /**
   * The URL/test is finished, all metrics are collected.
   */
  async afterEachURL() {}

  /**
   * This method is called if a runs fail
   */
  failing() {}

  /**
   * Get the HAR file for all the runs.
   */
  async getHARs() {
    return [];
  }

  /**
   * Before the browser is stopped/closed.
   */
  async beforeBrowserStop() {}

  async afterBrowserStopped() {
    if (this.safariOptions.useSimulator) {
      await command(
        'xcrun simctl terminate ' +
          this.safariOptions.deviceUDID +
          ' com.apple.mobilesafari',
        { shell: true }
      );
    }

    if (this.safariOptions.ios) {
      await this.driverProcess.kill('SIGINT', {
        forceKillAfterTimeout: 5000
      });
    }
  }

  async waitForNetworkIdle() {
    throw new Error('waitForNetworkIdle is not implemented in Safari');
  }
}
