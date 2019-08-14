'use strict';

// const log = require('intel').getLogger('browsertime.safari');

class SafariDelegate {
  constructor() {}

  async onStart() {}

  async afterBrowserStart() {}

  async onStartIteration() {}

  async onStopIteration() {}

  async beforeEachURL() {}

  async clear() {}

  async beforeCollect() {}

  async onCollect(runner, index, result) {
    const resource = await runner.runScript(
      'return performance.getEntriesByType("resource");',
      'RESOURCE_TIMINGS'
    );
    result.browserScripts.timings.resourceTimings = resource;
  }

  failing() {}

  async onStop() {
    return {};
  }
}

module.exports = SafariDelegate;
