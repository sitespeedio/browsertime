'use strict';

const harBuilder = require('../../support/har/');
const log = require('intel').getLogger('browsertime.firefox');
const fs = require('fs');
const { promisify } = require('util');
const rename = promisify(fs.rename);
const pathToFolder = require('../../support/pathToFolder');
const path = require('path');

class FirefoxDelegate {
  constructor(baseDir, options) {
    // Lets keep this and hope that we in the future will have HAR for FF again
    this.skipHar = options.skipHar;
    this.baseDir = baseDir;
    this.includeResponseBodies = options.firefox
      ? options.firefox.includeResponseBodies
      : 'none';
    this.firefoxConfig = options.firefox || {};
    this.options = options;
  }

  async onStart() {
    this.hars = [];
  }

  async onStartIteration() {}

  async onStopIteration() {}

  async clear() {}

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

    if (this.skipHar) {
      return;
    }

    const script = `
    var callback = arguments[arguments.length - 1];
    function triggerExport() {
      HAR.triggerExport()
        .then((result) => {
          // Different handling in FF 60 and 61 :|
          if (result.log) {
            result.log.pages[0].title = document.URL;
          }
          else {
            result.pages[0].title = document.URL;
          }
          // Normalize
          return callback({'har': result.log ? result: {log: result}});
      })
      .catch((e) => callback({'error': e}));
    };
      triggerExport();
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
          harResult.har.log.pages[0]._url = result.url;
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

  async onStop() {
    if (!this.skipHar && this.hars.length > 0) {
      return { har: harBuilder.mergeHars(this.hars) };
    } else {
      return {};
    }
  }
}

module.exports = FirefoxDelegate;
