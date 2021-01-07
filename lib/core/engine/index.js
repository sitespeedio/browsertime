'use strict';

const log = require('intel').getLogger('browsertime');
const merge = require('lodash.merge');
const getPort = require('get-port');
const get = require('lodash.get');
const set = require('lodash.set');
const StorageManager = require('../../support/storageManager');
const Firefox = require('../../firefox/webdriver/firefox');
const Chromium = require('../../chrome/webdriver/chromium');
const Safari = require('../../safari/webdriver/safari');
const { addConnectivity, removeConnectivity } = require('../../connectivity');
const util = require('../../support/util');
const harUtil = require('../../support/har/');
const XVFB = require('../../support/xvfb');
const Iteration = require('./iteration');
const Collector = require('./collector');
const { Android } = require('../../android/');
const { RootedDevice } = require('../../android/root');
const run = require('./run');
const engineUtils = require('../../support/engineUtils');

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
class Engine {
  constructor(options) {
    this.options = merge({}, defaults, options);
    if (log.isEnabledFor(log.DEBUG)) {
      log.debug('Running with options: %:2j', this.options);
    }
    this.myXVFB = new XVFB(this.options);
  }

  /**
   * Start the engine. Will prepare everything before you will start your run:
   * * Start XVFB (if it is configured)
   * * Set connectivity
   * * Start the extension server
   */
  async start() {
    this.options.devToolsPort = await getPort({
      port: getPort.makeRange(9222, 9350),
      host: '127.0.0.1'
    });

    if (get(this.options, 'connectivity.tsproxy.port') === undefined) {
      set(
        this.options,
        'connectivity.tsproxy.port',
        await getPort({
          port: getPort.makeRange(1080, 1099),
          host: '127.0.0.1'
        })
      );
    }
    if (!this.options.connectivity.variance) {
      await addConnectivity(this.options);
    }

    if (this.options.android) {
      const android = new Android(this.options);
      await android._init();
      this.android = android;

      const phoneState = await android.getPhoneState();
      if (phoneState !== 'device') {
        const message = `The phone ${android.id} state is ${phoneState}`;
        log.error(message);
        throw Error(message);
      }

      if (this.options.androidPretestPowerPress) {
        await android.clickPowerButton();
      }

      if (this.options.androidVerifyNetwork) {
        const pingAddress = get(this.options, 'androidPingAddress', '8.8.8.8');
        const connection = await android.ping(pingAddress);
        if (!connection) {
          const message = `No internet connection for ${android.id}. Could not ping ${pingAddress}`;
          log.error(message);
          throw Error(message);
        }
      }

      await android.closeAppNotRespondingPopup();

      // Make sure screen is on!
      await android._runCommand('svc power stayon true');

      if (this.options.androidRooted) {
        const gotRoot = await android._runCommandAndGet(
          'su - root -c "echo test"'
        );
        if (gotRoot.indexOf('not found') > -1) {
          log.info('Your phone do not have su, is it really rooted?');
        } else {
          this.rooted = new RootedDevice(this.android);
          await this.rooted.start();
        }
      }

      if (this.options.androidBatteryTemperatureLimit) {
        const maxTries = this.options.androidBatteryTemperatureMaxTries || 20;
        let batteryTry = 0;
        let temp = await android.getTemperature();
        const minTempLimit = this.options.androidBatteryTemperatureLimit;
        const waitTime =
          (this.options.androidBatteryTemperatureWaitTimeInSeconds || 120) *
          1000;
        if (temp > minTempLimit) {
          do {
            temp = await android.getTemperature();
            log.info(
              'Battery temperature is %s, waiting it to go down under %s, will sleep for %s s',
              temp,
              minTempLimit,
              waitTime / 1000
            );
            batteryTry++;
            if (batteryTry === maxTries) {
              log.error(
                'Battery temperature (%s) never got under %s after %s tries.',
                temp,
                minTempLimit,
                maxTries
              );
              if (this.options.androidBatteryTemperatureReboot) {
                log.info(
                  'Rebooting the device, will wait 1 minute for it to reboot.'
                );
                await android.reboot();
                await delay(60000);
              }
              throw Error(
                'Battery temperature never got under the configured limit'
              );
            }
            await delay(waitTime);
          } while (temp > minTempLimit);
        } else {
          log.info('Battery temperature is %s, lets start the tests', temp);
        }
      }
    }

    return Promise.all([this.myXVFB.start()]);
  }

  async runByScript(
    navigationScript,
    name,
    scriptsByCategory,
    asyncScriptsByCategory
  ) {
    const options = this.options;
    if (name instanceof Array) {
      name = name[0];
    }
    const storageManager = new StorageManager(name, options);
    let engineDelegate;
    switch (options.browser) {
      case 'firefox':
        engineDelegate = new Firefox(storageManager, this.options);
        break;
      case 'chrome':
        engineDelegate = new Chromium(storageManager, this.options);
        break;
      case 'edge':
        engineDelegate = new Chromium(storageManager, this.options);
        break;
      case 'safari':
        engineDelegate = new Safari(storageManager, this.options);
    }
    const iteration = new Iteration(
      storageManager,
      engineDelegate,
      scriptsByCategory,
      asyncScriptsByCategory,
      options
    );

    await storageManager.createDataDir();
    await engineDelegate.beforeBrowserStart(name, options);
    const collector = new Collector(name, storageManager, options);

    if (this.android) {
      const model = await this.android.getModel();
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
    for (let index = 1; index < options.iterations + 1; index++) {
      const data = await iteration.run(navigationScript, index);
      // Only collect if it was succesful
      // Here we got room for improvements
      if (data && data[0] && data[0].url) {
        await collector.perIteration(data, index);
      } else {
        log.error('No data to collect');
        // We can have errors that happend before we started to test the page
        // like starting the browser, missmatching WebDriver
        if (data.error) {
          errorsOutsideTheBrowser.push(...data.error);
        }
      }
      if (shouldDelay(index, options.iterations, options.delay)) {
        await delay(options.delay);
      }
    }

    const extras = await engineDelegate.getHARs();

    // Backfill the fully loaded data that we extract from the HAR
    if (!options.skipHar && extras.har) {
      const fullyLoadedPerUrl = harUtil.getFullyLoaded(extras.har);
      for (let data of fullyLoadedPerUrl) {
        collector.addFullyLoaded(data.url, data.fullyLoaded);
      }
    }

    const totalResult = collector.getResults();
    // Add extra fields to the HAR
    // to make the HAR files better when we use them in
    // compare.sitespeed.io
    if (!options.skipHar && extras.har) {
      harUtil.addExtraFieldsToHar(totalResult, extras.har, options);
      totalResult.har = extras.har;
    }
    util.logResultLogLine(totalResult);

    if (errorsOutsideTheBrowser.length > 0) {
      if (totalResult[0]) {
        totalResult[0].errors
          ? totalResult[0].errors.push(...errorsOutsideTheBrowser)
          : (totalResult[0].errors = errorsOutsideTheBrowser);
      } else {
        totalResult[0] = { errors: errorsOutsideTheBrowser };
      }
    }

    if (this.android) {
      const model = await this.android.getModel();
      for (let result of totalResult) {
        result.info.android = model;
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
    const scripts = [];
    let name;
    for (let urlOrFile of urlOrFiles) {
      if (typeof urlOrFile == 'string' && urlOrFile.indexOf('http') > -1) {
        scripts.push(urlOrFile);
      } else {
        let script = urlOrFile;
        if (urlOrFile instanceof Array) {
          script = urlOrFile[1];
        }

        script = engineUtils.loadScript(script, true);
        if (script.setUp) {
          if (!this.options.preScript) {
            this.options.preScript = [];
          }
          this.options.preScript.push(script.setUp);
        }

        if (script.tearDown) {
          if (!this.options.postScript) {
            this.options.postScript = [];
          }
          this.options.postScript.push(script.tearDown);
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
    if (!this.options.connectivity.variance) {
      await removeConnectivity(this.options);
    }

    if (this.options.androidRooted && this.rooted) {
      await this.rooted.stop();
    }

    return Promise.all([this.myXVFB.stop()]);
  }
}

module.exports = Engine;
