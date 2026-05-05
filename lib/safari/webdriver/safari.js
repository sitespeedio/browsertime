// const log = require('intel').getLogger('browsertime.safari');
import path from 'node:path';
import { randomUUID } from 'node:crypto';
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
        // Wake the iPhone into screen-capture mode by asking QuickTime to
        // open a new movie recording. cmiod only enumerates iOS devices
        // for CMIO when something triggers it (historically QuickTime),
        // so we drive QuickTime headlessly here to remove the manual step.
        // Once ios-capture has grabbed the AVCaptureSession the device
        // stays in mirror mode, so we quit QuickTime before safaridriver
        // starts — leaving QT holding the device blocks safaridriver from
        // opening a WebDriver session.
        await this._primeIOSScreenCapture();
        await this._startIOSCaptureServer();
        await this._unprimeIOSScreenCapture();
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
   * Use AppleScript to launch QuickTime Player and open a new movie
   * recording window. This is what wakes the connected iPhone into
   * screen-capture mode so cmiod will surface it to ios-capture.
   *
   * QuickTime stays running for the rest of the test session — its
   * default recording panel binds to the FaceTime camera, so it does
   * not contend with ios-capture for the iPhone. We quit QT in
   * afterBrowserStopped() once ios-capture has released the device.
   *
   * Best-effort: if osascript fails (e.g. Automation permission has
   * not been granted), we fall through to ios-capture which will then
   * emit its usual "no iOS device found" error and the user can fall
   * back to opening QuickTime manually.
   */
  async _primeIOSScreenCapture() {
    log.info(
      'Opening QuickTime Player to wake the iPhone into screen-capture mode (make sure the device is plugged in and unlocked)'
    );
    // launch (not activate) keeps QT from stealing focus. After the
    // recording window appears we minimise it to the Dock and try to
    // hide the whole process via System Events. The System Events call
    // requires Accessibility permission for osascript on first run; if
    // it's denied we fall through to just the minimised window.
    const script = `
      tell application "QuickTime Player"
        launch
        delay 0.5
        if (count of (documents whose name contains "Movie Recording")) is 0 then
          new movie recording
        end if
        delay 0.3
        try
          set miniaturized of every window to true
        end try
      end tell
      try
        tell application "System Events"
          set visible of process "QuickTime Player" to false
        end tell
      end try
    `;
    try {
      await execa('osascript', ['-e', script], { timeout: 10_000 });
      // Give cmiod a beat to enumerate the now-awake iPhone before
      // ios-capture starts looking for it.
      await delay(2000);
    } catch (error) {
      log.warn(
        'Could not prime iOS screen capture via QuickTime: %s. ' +
          'Open QuickTime Player → New Movie Recording manually before re-running.',
        error.message
      );
    }
  }

  /**
   * Quit QuickTime Player without saving — paired with
   * _primeIOSScreenCapture(). Best-effort.
   */
  async _unprimeIOSScreenCapture() {
    try {
      await execa(
        'osascript',
        ['-e', 'tell application "QuickTime Player" to quit saving no'],
        { timeout: 5000 }
      );
    } catch {
      // best-effort cleanup
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
    this.iosCaptureProcess = execa(iosCaptureCommand, ['-r', '60'], {
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
  async afterBrowserStart(runner) {
    if (this.safariOptions.ios && this.inspectorClient) {
      // iWDP exposes every open Safari tab on the device, not just the one
      // safaridriver controls. Drive the WebDriver tab to a unique sentinel
      // URL so the inspector can identify and pin it; otherwise an unrelated
      // tab's Target.targetCreated may clobber the active target and the HAR
      // comes back empty.
      const sentinel = `data:text/html;charset=utf-8,<title>browsertime-${randomUUID()}</title>`;
      try {
        await runner.getDriver().get(sentinel);
      } catch (error) {
        log.debug('Failed to navigate to sentinel URL: %s', error.message);
      }
      await this.inspectorClient.setup(page => page.url === sentinel);
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
