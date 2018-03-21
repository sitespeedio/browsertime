'use strict';

const harBuilder = require('../../support/har/');
const log = require('intel');
class FirefoxDelegate {
  constructor(options) {
    // Lets keep this and hope that we in the future will have HAR for FF again
    this.skipHar = options.skipHar;
    this.includeResponseBodies = options.firefox
      ? options.firefox.includeResponseBodies
      : 'none';
  }

  async onStartRun() {
    this.index = 1;
    this.hars = [];
  }

  async onStartIteration() {}

  async onStopIteration(runner) {
    if (this.skipHar) {
      return;
    }

    const script = `
    var callback = arguments[arguments.length - 1];
    function triggerExport() {
      HAR.triggerExport()
        .then((result) => {
          result.log.pages[0].title = document.title;
          return callback({'har': result});
      })
      .catch((e) => callback({'error': e}));
    };
      triggerExport();
    `;

    // Hack to get version of Firefox to make sure we only run the HAR export
    // trigger in Firefoxen that supports it.
    const ua = await runner.runScript(
      'return window.navigator.userAgent',
      'GET_VERSION_SCRIPT'
    );
    const match = ua.match(/(Firefox)\/(\S+)/);
    const version = Number(match[2]);

    if (version === 60 || version > 60) {
      log.info('Waiting on har-export-trigger to collect the HAR');
      const harResult = await runner.runAsyncScript(script, 'GET_HAR_SCRIPT');
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
      this.hars.push(harResult.har);
    } else {
      log.info('You need Firefox 60 (or later) to get the HAR.');
    }
    this.index++;
  }

  async onStopRun(result) {
    if (!this.skipHar && this.hars.length > 0) {
      result.har = harBuilder.mergeHars(this.hars);
    }
  }
}

module.exports = FirefoxDelegate;
