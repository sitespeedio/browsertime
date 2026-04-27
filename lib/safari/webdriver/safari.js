// const log = require('intel').getLogger('browsertime.safari');
import path from 'node:path';
import { execaCommand as command, execa } from 'execa';
import { getLogger } from '@sitespeed.io/log';
import { SafariInspectorClient } from '../safariInspectorClient.js';
import { WebkitToCdpAdapter } from '../webkitToCdpAdapter.js';
import { getHar } from '../har.js';
import { getEmptyHAR, mergeHars } from '../../support/har/index.js';

const delay = ms => new Promise(res => setTimeout(res, ms));
const log = getLogger('browsertime.safari');

export class Safari {
  constructor(storageManager, options) {
    this.options = options;
    this.safariOptions = options.safari || {};
    this.skipHar = options.skipHar || false;
    this.hars = [];
    this.aliasAndUrl = {};
    this.inspectorClient = undefined;
    this.adapter = undefined;
  }

  /**
   * Before the browser is started.
   */
  async beforeBrowserStart() {
    if (this.safariOptions.ios) {
      // Start ios-capture server BEFORE safaridriver to keep CoreMediaIO active
      if (this.options.video) {
        await this._startIOSCaptureServer();
      }

      this.driverProcess = command(
        'safaridriver -p ' + this.options.safariDriverPort,
        {
          shell: true
        }
      );
      await delay(2000);

      // Start the inspector client for HAR capture
      if (!this.skipHar) {
        this.inspectorClient = new SafariInspectorClient(this.options);
      }
    }
  }

  /**
   * Start the ios-capture server that enables CoreMediaIO and
   * accepts START/STOP recording commands.
   */
  async _startIOSCaptureServer() {
    const iosCaptureCommand = path.resolve(
      path.dirname(new URL(import.meta.url).pathname),
      '..',
      'native',
      'ios-capture'
    );

    log.debug('Starting ios-capture server');
    this.iosCaptureProcess = execa(iosCaptureCommand, ['-r', '30'], {
      stdin: 'pipe',
      stdout: 'pipe',
      stderr: 'pipe',
      reject: false
    });

    this.iosCaptureProcess.stderr.on('data', data => {
      log.debug('ios-capture: %s', data.toString().trim());
    });

    this.iosCaptureProcess.catch(error => {
      if (!error.isCanceled) {
        log.error('ios-capture process ended: %s', error.message);
      }
    });

    // Wait for READY signal
    await new Promise((resolve, reject) => {
      let buffer = '';
      const handler = data => {
        buffer += data.toString();
        if (buffer.includes('READY')) {
          this.iosCaptureProcess.stdout.removeListener('data', handler);
          resolve();
        }
        if (buffer.includes('ERROR')) {
          this.iosCaptureProcess.stdout.removeListener('data', handler);
          reject(new Error(`ios-capture: ${buffer.trim()}`));
        }
      };
      this.iosCaptureProcess.stdout.on('data', handler);
      setTimeout(
        () => reject(new Error('ios-capture server startup timeout')),
        15_000
      );
    });

    // Store the process on options so the IOSDeviceRecorder can access it
    this.options._iosCaptureProcess = this.iosCaptureProcess;
    log.debug('ios-capture server ready');
  }

  /**
   * The browser is up and running, now its time to start to
   * configure what you need.
   */
  async afterBrowserStart() {
    if (this.safariOptions.ios && this.inspectorClient) {
      await this.inspectorClient.setup();
    }
  }

  /**
   * Before the first iteration of your tests start.
   */
  async beforeStartIteration() {}

  /**
   * Before each URL/test runs.
   */
  async beforeEachURL() {
    if (this.inspectorClient) {
      this.adapter = new WebkitToCdpAdapter();
      this.inspectorClient.removeAllListeners();

      // Register listeners for all network and page events
      const networkEvents = [
        'Network.requestWillBeSent',
        'Network.responseReceived',
        'Network.dataReceived',
        'Network.loadingFinished',
        'Network.loadingFailed',
        'Network.requestServedFromMemoryCache',
        'Page.loadEventFired',
        'Page.domContentEventFired'
      ];
      for (const event of networkEvents) {
        this.inspectorClient.on(event, params => {
          this.adapter.onWebkitEvent(event, params);
        });
      }

      // Reconnect to iwdp to pick up any new pages after safaridriver setup
      try {
        await this.inspectorClient.reconnect();
      } catch (error) {
        log.debug('Reconnect attempt: %s', error.message);
      }
    }
  }

  /**
   * When the page has finsihed loading, this functions runs (before
   * collecting metrics etc). This is the place to get you HAR file,
   * stop trace logging, stop measuring etc.
   *
   */
  async afterPageCompleteCheck(runner, index, url, alias) {
    const resources = await runner.runScript(
      'return performance.getEntriesByType("resource");',
      'RESOURCE_TIMINGS'
    );

    const result = {
      browserScripts: {
        timings: {
          resourceTimings: resources
        }
      },
      url,
      alias
    };

    // Collect HAR from inspector client
    if (this.inspectorClient && this.adapter) {
      try {
        const har = await getHar(
          this.adapter,
          result,
          index,
          this.inspectorClient,
          this.safariOptions.includeResponseBodies,
          this.aliasAndUrl,
          this.options.cleanSensitiveHeaders
        );
        if (har.log.entries.length > 0) {
          this.hars.push(har);
          log.debug('Captured HAR with %d entries', har.log.entries.length);
        }
      } catch (error) {
        log.error('Failed to generate HAR: %s', error.message);
      }
    }

    return result;
  }

  /**
   * The URL/test is finished, all metrics are collected.
   */
  async afterEachURL() {}

  /**
   * This method is called if a runs fail
   */
  failing(url) {
    if (!this.skipHar) {
      this.hars.push(getEmptyHAR(url, 'Safari'));
    }
  }

  /**
   * Get the HAR file for all the runs.
   */
  async getHARs() {
    if (this.hars.length > 0) {
      return { har: mergeHars(this.hars) };
    }
    return {};
  }

  /**
   * Before the browser is stopped/closed.
   */
  async beforeBrowserStop() {
    if (this.inspectorClient) {
      await this.inspectorClient.close();
      this.inspectorClient = undefined;
    }
  }

  async afterBrowserStopped() {
    if (this.safariOptions.useSimulator) {
      await command(
        'xcrun simctl terminate ' +
          this.safariOptions.deviceUDID +
          ' com.apple.mobilesafari',
        { shell: true }
      );
    }

    if (this.safariOptions.ios && this.driverProcess) {
      const driverProc = this.driverProcess;
      this.driverProcess = undefined;
      try {
        driverProc.kill('SIGINT');
      } catch {
        // Already dead
      }
    }

    // Stop ios-capture server: send QUIT, then wait for it to exit and
    // release the AVCaptureSession on the iPhone. If we don't wait, the
    // device can stay locked in CMIO until something else evicts it,
    // which breaks subsequent runs (and even QuickTime).
    if (this.iosCaptureProcess) {
      const proc = this.iosCaptureProcess;
      this.iosCaptureProcess = undefined;
      try {
        proc.stdin.write('QUIT\n');
      } catch {
        // stdin already closed
      }
      try {
        await Promise.race([
          proc,
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error('ios-capture exit timeout')),
              5000
            )
          )
        ]);
      } catch {
        try {
          proc.kill('SIGTERM');
          await Promise.race([
            proc,
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('SIGTERM timeout')), 2000)
            )
          ]);
        } catch {
          try {
            proc.kill('SIGKILL');
          } catch {
            // Ignore
          }
        }
      }
    }
  }

  async waitForNetworkIdle() {
    throw new Error('waitForNetworkIdle is not yet implemented for Safari');
  }
}
