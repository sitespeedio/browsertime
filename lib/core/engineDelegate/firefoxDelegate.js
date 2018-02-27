'use strict';

const harBuilder = require('../../support/harBuilder');
const log = require('intel');
class FirefoxDelegate {
  constructor({ skipHar = false }) {
    // Lets keep this and hope that we in the future will have HAR for FF again
    this.skipHar = skipHar;
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
          return callback({'har': result});
      })
      .catch((e) => callback({'error': e}));
    };
      triggerExport();
    `;

    log.info('Waiting on har-export-trigger to collect the HAR');
    const harResult = await runner.runAsyncScript(script, 'GET_HAR_SCRIPT');
    this.hars.push(harResult.har);
    this.index++;
  }

  async onStopRun(result) {
    if (!this.skipHar && this.hars.length > 0) {
      result.har = harBuilder.mergeHars(this.hars);
    }
  }
}

module.exports = FirefoxDelegate;
