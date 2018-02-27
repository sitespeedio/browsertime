'use strict';

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

  async onStopIteration() {}

  async onStopRun() {}
}

module.exports = FirefoxDelegate;
