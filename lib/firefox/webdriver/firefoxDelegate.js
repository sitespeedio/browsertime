'use strict';

const log = require('intel').getLogger('browsertime.firefox');
const fs = require('fs');
const { promisify } = require('util');
const path = require('path');
const harBuilder = require('../../support/har/');
const pathToFolder = require('../../support/pathToFolder');
const rename = promisify(fs.rename);
const { isAndroidConfigured, Android } = require('../../android');
const geckoProfilerDefaults = require('../geckoProfilerDefaults');

class FirefoxDelegate {
  constructor(storageManager, options) {
    // Lets keep this and hope that we in the future will have HAR for FF again
    this.skipHar = options.skipHar;
    this.baseDir = storageManager.directory;
    this.storageManager = storageManager;
    this.includeResponseBodies = options.firefox
      ? options.firefox.includeResponseBodies
      : 'none';
    this.firefoxConfig = options.firefox || {};
    this.options = options;
    // We keep track of all alias and URLs
    this.aliasAndUrl = {};
  }

  async onStart() {
    this.hars = [];
  }

  async afterBrowserStart() {}

  async onStartIteration() {}

  async onStopIteration() {}

  async beforeEachURL(runner) {
    if (this.firefoxConfig.geckoProfiler) {
      const chosenFeatures = this.firefoxConfig.geckoProfilerParams.features.split(
        ','
      );
      const featureString = '["' + chosenFeatures.join('","') + '"]';

      const chosenThreads = this.firefoxConfig.geckoProfilerParams.threads.split(
        ','
      );
      const threadString = '["' + chosenThreads.join('","') + '"]';

      let interval = this.firefoxConfig.geckoProfilerParams.interval;

      // Set platform specific sampling intervals if not explicitly specified.
      if (
        this.firefoxConfig.geckoProfiler &&
        !this.firefoxConfig.geckoProfilerParams.interval
      ) {
        interval = isAndroidConfigured(this.options)
          ? geckoProfilerDefaults.android_sampling_interval
          : geckoProfilerDefaults.desktop_sampling_interval;
      }

      const bufferSize = this.firefoxConfig.geckoProfilerParams.bufferSize;

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
      return runner.runPrivilegedScript(script, 'Start GeckoProfiler');
    }
  }

  async clear() {}

  async beforeCollect() {}

  async onCollect(runner, index, result) {
    if (this.firefoxConfig.collectMozLog) {
      await rename(
        `${this.baseDir}/moz_log.txt`,
        path.join(
          this.baseDir,
          pathToFolder(result.url, this.options),
          `moz_log-${index}.txt`
        )
      );
      // TODO clear the original log file!
    }

    if (this.firefoxConfig.geckoProfiler) {
      let profileDir = await this.storageManager.createSubDataDir(
        path.join(pathToFolder(result.url, this.options))
      );
      let destinationFilename = path.join(
        profileDir,
        `geckoProfile-${index}.json`
      );

      let deviceProfileFilename = destinationFilename;
      if (isAndroidConfigured(this.options)) {
        deviceProfileFilename = `/sdcard/geckoProfile-${index}.json`;
      }

      // Must use String.raw or else the backslashes on Windows will be escapes.
      log.info(`Collecting Gecko profile in ${destinationFilename}`);
      const script = `
      var callback = arguments[arguments.length - 1];
       Services.profiler.dumpProfileToFileAsync(String.raw\`${deviceProfileFilename}\`)
        .then(callback)
        .catch((e) => callback({'error' : e}));
       `;
      await runner.runPrivilegedAsyncScript(script, 'Collect GeckoProfiler');
      log.info('Stop GeckoProfiler.');
      await runner.runPrivilegedScript(
        'Services.profiler.StopProfiler();',
        'Stop GeckoProfiler'
      );

      if (isAndroidConfigured(this.options)) {
        const android = new Android(this.options);
        await android._downloadFile(deviceProfileFilename, destinationFilename);
      }

      // GZIP the profile and remove the old file
      await this.storageManager.gzip(
        destinationFilename,
        path.join(profileDir, `geckoProfile-${index}.json.gz`),
        true
      );
    }

    if (this.skipHar) {
      return;
    }

    const script = `
    const callback = arguments[arguments.length - 1];
    async function triggerExport() {
      try {
        const result = await HAR.triggerExport();
        result.pages[0].title = document.URL;
        return callback({'har': {log: result}});
      }
      catch(e) {
        return callback({'error': e});
      }
    };
    return triggerExport();
    `;

    log.info('Waiting on har-export-trigger to collect the HAR');
    try {
      const harResult = await runner.runAsyncScript(script, 'GET_HAR_SCRIPT');
      if (harResult.har) {
        if (
          this.includeResponseBodies === 'none' ||
          this.includeResponseBodies === 'html'
        ) {
          for (let entry of harResult.har.log.entries) {
            if (this.includeResponseBodies === 'none') {
              delete entry.response.content.text;
            } else if (
              entry.response.content.mimeType &&
              entry.response.content.mimeType.indexOf('text/html') === -1
            ) {
              delete entry.response.content.text;
            }
          }
        }

        if (harResult.har.log.pages.length > 0) {
          // Hack to add the URL from a SPA

          if (result.alias && !this.aliasAndUrl[result.alias]) {
            this.aliasAndUrl[result.alias] = result.url;
            harResult.har.log.pages[0]._url = result.url;
          } else if (result.alias && this.aliasAndUrl[result.alias]) {
            harResult.har.log.pages[0]._url = this.aliasAndUrl[result.alias];
          } else {
            harResult.har.log.pages[0]._url = result.url;
          }
        }

        this.hars.push(harResult.har);
      } else {
        // We got an error from HAR exporter
        log.error(
          'Got an error from HAR Export Trigger ' +
            JSON.stringify(harResult.error)
        );
      }
    } catch (e) {
      log.error('Could not get the HAR from Firefox', e);
    }
  }

  failing(url) {
    if (this.skipHar) {
      return;
    }
    this.hars.push(harBuilder.getEmptyHAR(url, 'Firefox'));
  }

  async onStop() {
    if (!this.skipHar && this.hars.length > 0) {
      return { har: harBuilder.mergeHars(this.hars) };
    } else {
      return {};
    }
  }
}

module.exports = FirefoxDelegate;
