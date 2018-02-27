'use strict';

class FirefoxDelegate {
  constructor({ skipHar = false }) {
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
