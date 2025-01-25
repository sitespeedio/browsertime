import { arch as _arch } from 'node:os';
import { getLogger } from '@sitespeed.io/log';
import merge from 'lodash.merge';
import { execaCommand as command } from 'execa';
import { StorageManager } from '../../support/storageManager.js';
import { Firefox } from '../../firefox/webdriver/firefox.js';
import { Chromium } from '../../chrome/webdriver/chromium.js';
import { Safari } from '../../safari/webdriver/safari.js';
import {
  addConnectivity,
  removeConnectivity
} from '../../connectivity/index.js';
import { logResultLogLine, getProperty, toArray } from '../../support/util.js';
import {
  getFullyLoaded,
  getMainDocumentTimings,
  addExtraFieldsToHar
} from '../../support/har/index.js';
import { XVFB } from '../../support/xvfb.js';
import { Gnirehtet } from '../../android/gnirehtet.js';
import { Iteration } from './iteration.js';
import { Collector } from './collector.js';
import { Android, isAndroidConfigured } from '../../android/index.js';
import { RootedDevice } from '../../android/root.js';
import { run } from './run.js';
import { IOSRecorder } from '../../video/screenRecording/ios/iosRecorder.js';
import {
  loadPrePostScripts,
  loadScript,
  loadPageCompleteScript
} from '../../support/engineUtils.js';
import { getAvailablePort } from '../../support/getPort.js';
import { traceCategories as defaultChromeTraceCategories } from '../../chrome/settings/traceCategories.js';

const log = getLogger('browsertime');
const defaults = {
  scripts: [],
  iterations: 3,
  delay: 0,
  videoParams: {}
};
const delay = ms => new Promise(res => setTimeout(res, ms));

function shouldDelay(index, total, delay) {
  const isLast = total - index === 0;
  return delay > 0 && !isLast;
}

/**
 * Create a new Browsertime Engine.
 * @class
 */
export class Engine {
  constructor(options) {
    this.options = merge({}, defaults, options);

    log.debug('Running with options: %:2j', this.options);

    this.myXVFB = new XVFB(this.options);
  }

  /**
   * Start the engine. Will prepare everything before you will start your run:
   * * Start XVFB (if it is configured)
   * * Set connectivity
   * * Start the extension server
   */
  async start() {
    const options = this.options;

    options.devToolsPort = await getAvailablePort([9222, 9350]);

    log.debug(
      `Preparing port ${options.devToolsPort} for devtools on Chrome/Edge`
    );

    options.safariDriverPort = await getAvailablePort([1234, 2000]);

    if (options.browser === 'safari' && options.safari.ios && options.video) {
      await IOSRecorder.activate();
      await delay(2000);
    }

    await addConnectivity(options);

    if (isAndroidConfigured(options)) {
      const android = new Android(options);
      await android._init();
      this.android = android;

      if (options.android.gnirehtet === true && !options.webpagereplay) {
        this.gnirehtet = new Gnirehtet(options);
        await this.gnirehtet.start();
      }

      const phoneState = await android.getPhoneState();
      if (phoneState !== 'device') {
        const message = `The phone ${android.id} state is ${phoneState}`;
        log.error(message);
        throw new Error(message);
      }

      if (options.androidPretestPowerPress) {
        await android.clickPowerButton();
      }

      if (options.androidPretestPressHomeButton) {
        await android.pressHomeButton();
      }

      if (options.androidVerifyNetwork) {
        const pingAddress = getProperty(
          options,
          'androidPingAddress',
          '8.8.8.8'
        );
        const connection = await android.ping(pingAddress);
        if (!connection) {
          const message = `No internet connection for ${android.id}. Could not ping ${pingAddress}`;
          log.error(message);
          throw new Error(message);
        }
      }

      await android.closeAppNotRespondingPopup();

      // Make sure screen is on!
      await android._runCommand('svc power stayon true');

      if (options.androidRooted) {
        const gotRoot = await android._runCommandAndGet(
          'su - root -c "echo test"'
        );
        if (gotRoot.includes('not found')) {
          log.info('Your phone do not have su, is it really rooted?');
        } else {
          this.rooted = new RootedDevice(this.android, options);
          await this.rooted.start();
        }
      }

      if (options.androidBatteryTemperatureLimit) {
        const maxTries = options.androidBatteryTemperatureMaxTries || 20;
        let batteryTry = 0;
        let temporary = await android.getTemperature();
        const minTemporaryLimit = options.androidBatteryTemperatureLimit;
        const waitTime =
          (options.androidBatteryTemperatureWaitTimeInSeconds || 120) * 1000;
        if (temporary > minTemporaryLimit) {
          do {
            temporary = await android.getTemperature();
            log.info(
              'Battery temperature is %s, waiting it to go down under %s, will sleep for %s s',
              temporary,
              minTemporaryLimit,
              waitTime / 1000
            );
            batteryTry++;
            if (batteryTry === maxTries) {
              log.error(
                'Battery temperature (%s) never got under %s after %s tries.',
                temporary,
                minTemporaryLimit,
                maxTries
              );
              if (options.androidBatteryTemperatureReboot) {
                log.info(
                  'Rebooting the device, will wait until ADB sees the device'
                );
                await android.reboot();
              }
              throw new Error(
                'Battery temperature never got under the configured limit'
              );
            }
            await delay(waitTime);
          } while (temporary > minTemporaryLimit);
        } else {
          log.info(
            'Battery temperature is %s, lets start the tests',
            temporary
          );
        }
      }

      if (options.connectivity && options.connectivity.engine === 'humble') {
        const wifiName = await android.getWifi();
        log.info('The phone is using the WiFi: %s', wifiName);
      }
    }

    if (options.safari && options.safari.useSimulator) {
      // Start the simulator
      try {
        await command(
          'open -a /Applications/Xcode.app/Contents/Developer/Applications/Simulator.app/',
          { shell: true }
        );
        await delay(4000);
      } catch (error) {
        log.error('Could not start the Simulator.app', error);
        throw error;
      }

      const { stdout } = await command('xcrun simctl list devices -j', {
        shell: true
      });

      const simulatedDevices = JSON.parse(stdout);
      const types = Object.keys(simulatedDevices.devices);
      for (let type of types) {
        for (let device of simulatedDevices.devices[type]) {
          if (device.udid === options.safari.deviceUDID) {
            this.iosSimulatorDeviceName = device.name;
            log.info(
              'Running test on %s simulator using %s',
              this.iosSimulatorDeviceName,
              _arch()
            );
            break;
          }
        }
      }
    }

    return this.myXVFB.start();
  }

  async runByScript(
    navigationScript,
    name,
    scriptsByCategory,
    asyncScriptsByCategory
  ) {
    const options = this.options;
    if (Array.isArray(name)) {
      name = name[0];
    }
    const storageManager = new StorageManager(name, options);
    let engineDelegate;
    switch (options.browser) {
      case 'firefox': {
        engineDelegate = new Firefox(storageManager, options);
        break;
      }
      case 'chrome': {
        engineDelegate = new Chromium(storageManager, options);
        break;
      }
      case 'edge': {
        engineDelegate = new Chromium(storageManager, options);
        break;
      }
      case 'safari': {
        engineDelegate = new Safari(storageManager, options);
      }
    }

    let preScripts, postScripts, postURLScripts, pageCompleteCheck;

    try {
      preScripts = await loadPrePostScripts(options.preScript, options);
      postScripts = await loadPrePostScripts(options.postScript, options);
      postURLScripts = await loadPrePostScripts(options.postURLScript, options);
      pageCompleteCheck = options.pageCompleteCheck
        ? await loadPageCompleteScript(options.pageCompleteCheck)
        : undefined;
    } catch (error) {
      log.error(error.message);
      throw error;
    }

    const iteration = new Iteration(
      storageManager,
      engineDelegate,
      scriptsByCategory,
      asyncScriptsByCategory,
      preScripts,
      postScripts,
      postURLScripts,
      pageCompleteCheck,
      options
    );

    await storageManager.createDataDir();
    await engineDelegate.beforeBrowserStart(name, options);
    const collector = new Collector(name, storageManager, options);

    if (isAndroidConfigured(options)) {
      const model = await this.android.getMeta();
      log.info(
        'Run tests on %s [%s] using Android version %s',
        model.model,
        this.android.id,
        model.androidVersion
      );
    }
    log.info(
      'Running tests using %s - %s iteration(s)',
      `${options.browser[0].toUpperCase()}${options.browser.slice(1)}`,
      options.iterations
    );

    const errorsOutsideTheBrowser = [];
    const failures = [];
    for (let index = 1; index < options.iterations + 1; index++) {
      const data = await iteration.run(navigationScript, index);
      // Only collect if it was succesful
      // Here we got room for improvements
      if (data && data[0] && data[0].url) {
        await collector.perIteration(data, index);
        // If we have a failure from scripting
        if (data.markedAsFailure) {
          failures.push(...data.failureMessages);
        }
      } else {
        log.error('No data to collect');
        // We can have errors that happend before we started to test the page
        // like starting the browser, missmatching WebDriver
        if (data.error) {
          errorsOutsideTheBrowser.push(...data.error);
        }

        // Catch failures like starting the browser
        if (data.markedAsFailure) {
          failures.push(...data.failureMessages);
        }
      }
      if (shouldDelay(index, options.iterations, options.delay)) {
        await delay(options.delay);
      }
    }

    const extras = await engineDelegate.getHARs();

    // Backfill the fully loaded data that we extract from the HAR
    // Only do this if we actually had requests
    if (
      !options.skipHar &&
      extras.har &&
      extras.har.log &&
      extras.har.log.entries.length > 0
    ) {
      const fullyLoadedPerUrl = getFullyLoaded(extras.har);
      for (let data of fullyLoadedPerUrl) {
        if (data.url === undefined) {
          log.error(
            'There is an page without an URL in the HAR. Please inspect the HAR file and check whats wrong'
          );
        } else {
          collector.addFullyLoaded(data.url, data.fullyLoaded);
        }
      }

      // Add the timings from the main document
      const timings = getMainDocumentTimings(extras.har);
      for (let timing of timings) {
        collector.addMainDocumentTimings(timing.url, timing.timings);
      }
    }

    const totalResult = collector.getResults();
    // Add extra fields to the HAR
    // to make the HAR files better when we use them in
    // compare.sitespeed.io
    if (!options.skipHar && extras.har) {
      addExtraFieldsToHar(totalResult, extras.har, options);
      totalResult.har = extras.har;

      // Backfill browser and version
      for (let result of totalResult) {
        result.info.browser.name = extras.har.log.browser.name;
        result.info.browser.version = extras.har.log.browser.version;
        if (options.browser === 'firefox' && options.firefox) {
          result.info.browser.args = options.firefox.args;
          if (options.firefox.geckoProfiler === true) {
            result.info.browser.geckProfilerFeatures =
              options.firefox.geckoProfilerParams.features;
          }
          result.info.browser.preference = options.firefox.preference;
        } else if (options.browser === 'chrome') {
          if (options.chrome) {
            result.info.browser.args = options.chrome.args;
          }
          if (
            options.chrome &&
            (options.cpu || options.chrome.timeline || options.chrome.trace)
          ) {
            // get correct trace categories
            let chromeTraceCategories = options.chrome.traceCategories
              ? options.chrome.traceCategories.split(',')
              : [...defaultChromeTraceCategories];

            if (options.chrome.enableTraceScreenshots) {
              chromeTraceCategories.push(
                'disabled-by-default-devtools.screenshot'
              );
            }

            if (options.chrome && options.chrome.traceCategory) {
              const extraCategories = toArray(options.chrome.traceCategory);
              Array.prototype.push.apply(
                chromeTraceCategories,
                extraCategories
              );
            }

            result.info.browser.traceCategories = chromeTraceCategories;
          }
        }
      }
    } else if (options.browser === 'safari') {
      for (let result of totalResult) {
        result.info.browser.name = 'Safari';
        // Hack to get Safari version
        // WHen the user agent change we do not want Browsertime to break so
        // swallow it
        try {
          const vString = result.info.browser.userAgent.split('Version/')[1];
          result.info.browser.version = vString.split(' ')[0];
        } catch {
          // Just swallow
        }
      }
    } // We don't have a HAR for Firefox on Android
    else if (options.browser === 'firefox' && isAndroidConfigured(options)) {
      for (let result of totalResult) {
        result.info.browser.name = 'Firefox';
        try {
          const vString = result.info.browser.userAgent.split('Firefox/')[1];
          result.info.browser.version = vString;
        } catch {
          // Just swallow
        }
      }
    }

    if (!options.enableProfileRun) {
      logResultLogLine(totalResult);
    }

    if (failures.length > 0) {
      // If we have a result
      if (totalResult[0]) {
        totalResult[0].markedAsFailure = 1;
        totalResult[0].failureMessages = failures;
      } else {
        // If we didn't have a result, we still want the failure
        totalResult[0] = { markedAsFailure: 1, failureMessages: failures };
      }
    }

    if (errorsOutsideTheBrowser.length > 0) {
      if (totalResult[0]) {
        totalResult[0].errors
          ? totalResult[0].errors.push(...errorsOutsideTheBrowser)
          : (totalResult[0].errors = errorsOutsideTheBrowser);
      } else {
        totalResult[0] = { errors: errorsOutsideTheBrowser };
      }
    }

    if (isAndroidConfigured(options)) {
      const model = await this.android.getMeta();
      for (let result of totalResult) {
        result.info.android = model;
      }
    }

    if (options.safari && options.safari.useSimulator) {
      for (let result of totalResult) {
        result.info.ios = {
          deviceName: this.iosSimulatorDeviceName + ' simulator',
          deviceUDID: options.safari.deviceUDID,
          arch: _arch()
        };
      }
    }
    return totalResult;
  }

  async run(url, scriptsByCategory, asyncScriptsByCategory) {
    return this.runByScript(
      run([url]),
      url,
      scriptsByCategory,
      asyncScriptsByCategory
    );
  }

  async runMultiple(urlOrFiles, scriptsByCategory, asyncScriptsByCategory) {
    const options = this.options;
    const scripts = [];
    let name;
    for (let urlOrFile of urlOrFiles) {
      if (typeof urlOrFile == 'string' && urlOrFile.includes('http')) {
        scripts.push(urlOrFile);
      } else {
        let script = urlOrFile;
        if (Array.isArray(urlOrFile)) {
          script = urlOrFile[1];
        }
        script = await loadScript(script, options, true);

        if (script.setUp) {
          if (!options.preScript) {
            options.preScript = [];
          }
          options.preScript.push(script.setUp);
        }

        if (script.tearDown) {
          if (!options.postScript) {
            options.postScript = [];
          }
          options.postScript.push(script.tearDown);
        }
        // here, url is the filename containing the script, and test the callable.
        if (script.test) {
          scripts.push(script.test);
        } else {
          scripts.push(script);
        }
      }
      if (!name) {
        name = urlOrFile;
      }
    }
    return this.runByScript(
      run(scripts),
      name,
      scriptsByCategory,
      asyncScriptsByCategory
    );
  }

  /**
   * Stop the engine. Will stop everything started in start().
   * * Stop XVFB (if it is configured)
   * * Remove connectivity
   * * Stop the extension server
   */
  async stop() {
    const options = this.options;
    await removeConnectivity(options);

    if (options.androidRooted && this.rooted) {
      await this.rooted.stop();
    }

    if (options.safari && options.safari.useSimulator) {
      try {
        await command('pkill -x Simulator', { shell: true });
      } catch {
        log.error('Could not stop the iOS simulator');
      }
    }

    if (
      !options.webpagereplay &&
      options.android &&
      options.android.gnirehtet === true &&
      this.gnirehtet
    ) {
      await this.gnirehtet.stop();
    }

    return this.myXVFB.stop();
  }
}
