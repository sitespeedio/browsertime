import { join } from 'node:path';
import get from 'lodash.get';
import intel from 'intel';
import {
  android_sampling_interval,
  desktop_sampling_interval
} from './settings/geckoProfilerDefaults.js';
import { isAndroidConfigured, Android } from '../android/index.js';
import { pathToFolder } from '../support/pathToFolder.js';
import { BrowserError } from '../support/errors.js';
const delay = ms => new Promise(res => setTimeout(res, ms));
const log = intel.getLogger('browsertime.firefox');

/**
 * Timeout a promise after ms. Use promise.race to compete
 * about the timeout and the promise.
 * @param {promise} promise - The promise to wait for
 * @param {int} ms - how long in ms to wait for the promise to fininsh
 * @param {string} errorMessage - the error message in the Error if we timeouts
 */
async function timeout(promise, ms, errorMessage) {
  let timer;

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
export class GeckoProfiler {
  constructor(runner, storageManager, options) {
    this.runner = runner;
    this.storageManager = storageManager;
    this.firefoxConfig = options.firefox;
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
        ? android_sampling_interval
        : desktop_sampling_interval;
    }

    const bufferSize = firefoxConfig.geckoProfilerParams.bufferSize;

    // Firefox 69 and above has a slightly different API for StartProfiler
    // See nsIProfiler::StartProfiler in tools/profiler/gecko/nsIProfiler.idl
    const parameterLength = await runner.runPrivilegedScript(
      'return Services.profiler.StartProfiler.length;',
      'Get StartProfiler.length'
    );

    let script;
    switch (parameterLength) {
      case 7: {
        // Oldest profiler API. It was deprecated in Firefox 69.
        script = `Services.profiler.StartProfiler(${bufferSize},${interval},${featureString},
          ${chosenFeatures.length},${threadString},${chosenThreads.length});`;
        break;
      }
      case 6: {
        // Newest profiler API. It's being used since Firefox 72.
        // `activeBrowserId` is useful for distinguishing browser tabs in the profiler UI.
        const activeBrowserIdScript = `
          const win = Services.wm.getMostRecentWindow("navigator:browser");
          return win?.gBrowser?.selectedBrowser?.browsingContext?.browserId ?? 0;
      `;
        const activeBrowserId = await runner.runPrivilegedScript(
          activeBrowserIdScript,
          'Get activeBrowserId'
        );
        script = `Services.profiler.StartProfiler(${bufferSize},${interval},${featureString},
          ${threadString},${activeBrowserId});`;
        break;
      }
      case 5: {
        // The profiler API that was used between Firefox 69 and 72.
        script = `Services.profiler.StartProfiler(${bufferSize},${interval},${featureString},
          ${threadString});`;
        break;
      }
      default: {
        log.error('Unknown Gecko Profiler API');
        throw new Error('Unknown Gecko Profiler API');
      }
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
      join(pathToFolder(url, options))
    );
    let destinationFilename = join(profileDir, `geckoProfile-${index}.json`);

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
    // Pause profiler before we collect the profile, so that we don't capture
    // more samples while the parent process waits for subprocess profiles.
    await runner.runPrivilegedScript(
      'Services.profiler.Pause();',
      'Pause GeckoProfiler.'
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
        1_200_000,
        'Could not get the Geckoprofiler log'
      );
      log.info('Stop GeckoProfiler.');
      await runner.runPrivilegedScript(
        'Services.profiler.StopProfiler();',
        'Stop GeckoProfiler'
      );

      if (isAndroidConfigured(options)) {
        log.info('Download profile file from Android.');
        const android = new Android(options);
        await android._downloadFile(deviceProfileFilename, destinationFilename);
      }

      // GZIP the profile and remove the old file
      log.info('Gzip file the profile.');
      await timeout(
        storageManager.gzip(
          destinationFilename,
          join(profileDir, `geckoProfile-${index}.json.gz`),
          true
        ),
        300_000, // 5 minutes
        'Could not gzip the profile.'
      );

      log.info('Done stopping GeckoProfiler.');
    } catch (error) {
      log.error(error.message);
    }
  }

  addMetaData() {}
}
