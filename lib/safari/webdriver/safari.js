'use strict';

// const log = require('intel').getLogger('browsertime.safari');
const execa = require('execa');
const log = require('intel').getLogger('browsertime.safari');
class Safari {
  constructor(storageManager, options) {
    this.options = options;
    this.safariOptions = options.safari || {};
  }

  /**
   * Before the browser is started.
   */
  async beforeBrowserStart() {
    if (this.safariOptions.useSimulator) {
      return execa.command(
        'open -a /Applications/Xcode.app/Contents/Developer/Applications/Simulator.app/',
        { shell: true }
      );
    }
  }

  /**
   * The browser is up and running, now its time to start to
   * configure what you need.
   */
  async afterBrowserStart() {
    if (this.safariOptions.useSimulator) {
      const { stdout } = await execa.command('xcrun simctl list devices -j', {
        shell: true
      });

      const simulatedDevices = JSON.parse(stdout);
      const types = Object.keys(simulatedDevices.devices);
      for (let type of types) {
        for (let device of simulatedDevices.devices[type]) {
          if (device.udid === this.safariOptions.deviceUDID) {
            this.deviceName = device.name;
            log.info('Running test on %s simulator', this.deviceName);
            break;
          }
        }
      }
    }
  }

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
      return execa.command(
        'xcrun simctl terminate booted com.apple.mobilesafari',
        { shell: true }
      );
    }
  }
}

module.exports = Safari;
