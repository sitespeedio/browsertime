'use strict';
const log = require('intel').getLogger('browsertime.firefox');
const geckoProfilerDefaults = require('./settings/geckoProfilerDefaults');
const { isAndroidConfigured, Android } = require('../android');
const path = require('path');
const get = require('lodash.get');
const pathToFolder = require('../support/pathToFolder');
const { BrowserError } = require('../support/errors');
const delay = ms => new Promise(res => setTimeout(res, ms));

/**
 * Timeout a promise after ms. Use promise.race to compete
 * about the timeout and the promise.
 * @param {promise} promise - The promise to wait for
 * @param {int} ms - how long in ms to wait for the promise to fininsh
 * @param {string} errorMessage - the error message in the Error if we timeouts
 */
async function timeout(promise, ms, errorMessage) {
  let timer = null;

  return Promise.race([
    new Promise((resolve, reject) => {
      timer = setTimeout(reject, ms, new BrowserError(errorMessage));
      return timer;
    }),
    promise.then(value => {
      clearTimeout(timer);
      return value;
    })
  ]);
}
class GeckoProfiler {
  constructor(runner, storageManager, firefoxConfig, options) {
    this.runner = runner;
    this.storageManager = storageManager;
    this.firefoxConfig = firefoxConfig;
    this.options = options;
  }

  async start() {
    const runner = this.runner;
    const firefoxConfig = this.firefoxConfig;
    const options = this.options;
    const chosenFeatures =
      firefoxConfig.geckoProfilerParams.features.split(',');
    const featureString = '["' + chosenFeatures.join('","') + '"]';

    const chosenThreads = firefoxConfig.geckoProfilerParams.threads.split(',');
    const threadString = '["' + chosenThreads.join('","') + '"]';

    let interval = firefoxConfig.geckoProfilerParams.interval;

    // Set platform specific sampling intervals if not explicitly specified.
    if (
      firefoxConfig.geckoProfiler &&
      !firefoxConfig.geckoProfilerParams.interval
    ) {
      interval = isAndroidConfigured(options)
        ? geckoProfilerDefaults.android_sampling_interval
        : geckoProfilerDefaults.desktop_sampling_interval;
    }

    const bufferSize = firefoxConfig.geckoProfilerParams.bufferSize;

    // Firefox 69 and above has a slightly different API for StartProfiler
    // See nsIProfiler::StartProfiler in tools/profiler/gecko/nsIProfiler.idl
    const parameterLength = await runner.runPrivilegedScript(
      'return Services.profiler.StartProfiler.length;',
      'Get StartProfiler.length'
    );

    let script;
    if (parameterLength === 7) {
      script = `Services.profiler.StartProfiler(${bufferSize},${interval},${featureString},
        ${chosenFeatures.length},${threadString},${chosenThreads.length});`;
    } else if (parameterLength === 5 || parameterLength === 6) {
      script = `Services.profiler.StartProfiler(${bufferSize},${interval},${featureString},${threadString});`;
    } else {
      log.error('Unknown Gecko Profiler API');
      throw new Error('Unknown Gecko Profiler API');
    }

    log.info(
      'Start GeckoProfiler with features: %s and threads: %s',
      featureString,
      threadString
    );

    await runner.runPrivilegedScript(script, 'Start GeckoProfiler');
    return delay(firefoxConfig.geckoProfilerSettleTime || 3000);
  }

  async stop(index, url) {
    const runner = this.runner;
    const storageManager = this.storageManager;
    const options = this.options;
    let profileDir = await storageManager.createSubDataDir(
      path.join(pathToFolder(url, options))
    );
    let destinationFilename = path.join(
      profileDir,
      `geckoProfile-${index}.json`
    );

    let deviceProfileFilename = destinationFilename;
    if (isAndroidConfigured(options)) {
      deviceProfileFilename = `/sdcard/Android/data/${get(
        this.firefoxConfig,
        'android.package',
        'org.mozilla.firefox'
      )}/files/geckoProfile-${index}.json`;
    }

    // Must use String.raw or else the backslashes on Windows will be escapes.
    log.info(
      `Collecting Gecko profile from ${deviceProfileFilename} to ${destinationFilename}`
    );
    const script = `
      var callback = arguments[arguments.length - 1];
       Services.profiler.dumpProfileToFileAsync(String.raw\`${deviceProfileFilename}\`)
        .then(callback)
        .catch((e) => callback({'error' : e}));
       `;
    try {
      await timeout(
        runner.runPrivilegedAsyncScript(script, 'Collect GeckoProfiler'),
        1200000,
        'Could not get the Geckoprofiler log'
      );
      log.info('Stop GeckoProfiler.');
      await runner.runPrivilegedScript(
        'Services.profiler.StopProfiler();',
        'Stop GeckoProfiler'
      );

      if (isAndroidConfigured(options)) {
        const android = new Android(options);
        await android._downloadFile(deviceProfileFilename, destinationFilename);
      }

      // GZIP the profile and remove the old file
      return storageManager.gzip(
        destinationFilename,
        path.join(profileDir, `geckoProfile-${index}.json.gz`),
        true
      );
    } catch (e) {
      log.error(e.message);
    }
  }

  addMetaData() {}
}

module.exports = GeckoProfiler;
