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
  constructor() {}

  async start() {
    this.extensionServer = await httpServer.startServer();
  }

  async stop() {
    if (this.extensionServer) {
      await httpServer.stopServer(this.extensionServer);
    }
  }

  /**
   * Run the extension but only if the options match what the
   * extension handles.
   */
  async setupExtension(url, browser, options) {
    // always start with running our extension for the setup
    if (
      options.cacheClearRaw ||
      (options.requestheader && options.browser === 'firefox') ||
      options.block ||
      options.basicAuth ||
      options.cookie ||
      (options.injectJs && options.browser === 'firefox') ||
      options.clearCacheKeepCookies
    ) {
      const port = this.extensionServer.address().port;
      await setup(url, browser, port, options);
    }
  }
}

module.exports = ExtensionServer;
