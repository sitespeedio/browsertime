'use strict';

// const log = require('intel').getLogger('browsertime.safari');

class SafariDelegate {
  constructor() {}

  async beforeBrowserStart() {}
  async beforeBrowserStop() {}
  async afterBrowserStart() {}
  async beforeStartIteration() {}
  async onStopIteration() {}
  async beforeEachURL() {}

  async afterPageCompleteCheck(runner) {
    const resources = await runner.runScript(
      'return performance.getEntriesByType("resource");',
      'RESOURCE_TIMINGS'
    );

    return {
      browserScripts: {
        timings: {
          resourceTimings: resources
        }
      }
    };
  }

  async afterEachURL() {}

  failing() {}

  async getHARs() {
    return [];
  }

  async onStop() {
    return {};
  }
}

module.exports = SafariDelegate;
