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

  async onCollect() {}

  failing() {}

  async onStop() {
    return {};
  }
}

module.exports = SafariDelegate;
