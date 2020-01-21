'use strict';

const httpServer = require('./httpServer');
const setup = require('./setup');

/**
 * Create a ExtensionServer. The extension server helps us with
 * running the Browsertime extension, making it possible to
 * use a WebExtension to prepare our tests.
 * @class
 */
class ExtensionServer {
  constructor(options) {
    this.options = options;
  }

  _useServer(newOptions) {
    const options = newOptions || this.options;
    if (
      options.browser === 'firefox' &&
      (options.cacheClearRaw ||
        options.requestheader ||
        options.block ||
        options.basicAuth ||
        options.cookie ||
        options.injectJs ||
        options.clearCacheKeepCookies)
    ) {
      return true;
    } else return false;
  }

  async _start() {
    if (!this.extensionServer) {
      this.extensionServer = await httpServer.startServer();
    }
  }

  async _stop() {
    if (this.extensionServer) {
      await httpServer.stopServer(this.extensionServer);
      this.extensionServer = undefined;
    }
  }

  async setup(url, browser, setupOptions) {
    if (this._useServer(setupOptions)) {
      await this._start();
      const port = this.extensionServer.address().port;
      await setup(url, browser, port, setupOptions);
      return this._stop();
    }
  }
}

module.exports = ExtensionServer;
