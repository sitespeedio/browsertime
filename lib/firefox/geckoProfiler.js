import path from 'node:path';
import { getLogger } from '@sitespeed.io/log';
import { geckoProfilerDefaults } from './settings/geckoProfilerDefaults.js';
import { isAndroidConfigured, Android } from '../android/index.js';
import { pathToFolder } from '../support/pathToFolder.js';
import { BrowserError } from '../support/errors.js';
import { getProperty } from '../support/util.js';
const delay = ms => new Promise(res => setTimeout(res, ms));
const log = getLogger('browsertime.firefox');

// Return power usage in Wh for a single counter.
function computeCounterPowerSum(counter) {
  let sum = 0;
  // Older Firefoxes see https://github.com/sitespeedio/sitespeed.io/issues/3944#issuecomment-1871090793
  if (counter.sample_groups) {
    for (const groups of counter.sample_groups) {
      const countIndex = groups.samples.schema.count;
      // NOTE: We intentionally ignore the first index of the counters as they
      // might contain incorrect values.
      for (
        let sampleIndex = 1;
        sampleIndex < groups.samples.data.length;
        sampleIndex++
      ) {
        sum += groups.samples.data[sampleIndex][countIndex];
      }
    }
  } else {
    const countIndex = counter.samples.schema.count;
    // NOTE: We intentionally ignore the first index of the counters as they
    // might contain incorrect values.
    for (
      let sampleIndex = 1;
      sampleIndex < counter.samples.data.length;
      sampleIndex++
    ) {
      sum += counter.samples.data[sampleIndex][countIndex];
    }
  }

  return sum * 1e-12;
}

// Return the power usage by the whole profile including the sub processes.
// The return value is in Wh value.
function computeFullProfilePower(profile) {
  let power = 0;
  for (const counter of profile.counters) {
    if (
      counter.category === 'power' &&
      // If power counters starts with "Power:", it means that there are several
      // individual components that Firefox records. For Linux and Windows,
      // intel CPUs might produce 'CPU package' to show the whole power
      // consumption of the CPU. But on top of that it also shows some individual
      // components like, DRAM, iGPU, individual CPU cores etc. We don't want
      // to include them as it might produce double the power values it normally consumes.
      //
      // Linux track names: https://searchfox.org/mozilla-central/rev/5ad94327fc03d0e5bc6aa81c0d7d113c2dccf947/tools/profiler/core/PowerCounters-linux.cpp#48-70
      // Windows track names: https://searchfox.org/mozilla-central/rev/5ad94327fc03d0e5bc6aa81c0d7d113c2dccf947/tools/profiler/core/PowerCounters-win.cpp#32-55
      (!counter.name.startsWith('Power:') ||
        counter.name === 'Power: CPU package')
    ) {
      power += computeCounterPowerSum(counter);
    }
  }

  for (const subprocessProfile of profile.processes) {
    power += computeFullProfilePower(subprocessProfile);
  }

  return power;
}

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
    const chosenFeatures = getProperty(
      firefoxConfig,
      'geckoProfilerParams.features',
      geckoProfilerDefaults.features
    ).split(',');

    const featureString = '["' + chosenFeatures.join('","') + '"]';

    const chosenThreads = getProperty(
      firefoxConfig,
      'geckoProfilerParams.threads',
      geckoProfilerDefaults.threads
    ).split(',');
    const threadString = '["' + chosenThreads.join('","') + '"]';

    let interval = getProperty(
      firefoxConfig,
      'geckoProfilerParams.interval',
      geckoProfilerDefaults.interval
    );

    // Set platform specific sampling intervals if not explicitly specified.
    if (
      firefoxConfig.geckoProfiler &&
      !firefoxConfig.geckoProfilerParams.interval
    ) {
      interval = isAndroidConfigured(options)
        ? geckoProfilerDefaults.androidSamplingInterval
        : geckoProfilerDefaults.desktopSamplingInterval;
    }

    const bufferSize = getProperty(
      firefoxConfig,
      'geckoProfilerParams.bufferSize',
      geckoProfilerDefaults.bufferSize
    );

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

  async stop(index, url, result) {
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
      deviceProfileFilename = `/sdcard/Android/data/${getProperty(
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

      if (this.firefoxConfig.powerConsumption === true) {
        const chosenFeatures = getProperty(
          this.firefoxConfig,
          'geckoProfilerParams.features',
          geckoProfilerDefaults.features
        );
        if (chosenFeatures.includes('power')) {
          log.info('Collecting CPU power consumption');
          const profile = JSON.parse(
            await storageManager.readData(
              `geckoProfile-${index}.json`,
              path.join(pathToFolder(url, options))
            )
          );

          result.powerConsumption = computeFullProfilePower(profile);
        } else {
          log.warning(
            'Missing power setting in geckoProfilerParams.features so power will not be collected'
          );
        }
      }

      // GZIP the profile and remove the old file
      log.info('Gzip file the profile.');
      const name = this.options.enableProfileRun
        ? `geckoProfile-${index}-extra.json.gz`
        : `geckoProfile-${index}.json.gz`;
      await timeout(
        storageManager.gzip(
          destinationFilename,
          path.join(profileDir, name),
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
