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
  async setupExtension(url, browser) {
    // always start with running our extension for the setup
    if (
      this.options.cacheClearRaw ||
      this.options.requestheader ||
      this.options.block ||
      this.options.basicAuth ||
      this.options.cookie ||
      this.options.injectJs
    ) {
      const port = this.extensionServer.address().port;
      await setup(url, browser, port, this.options);
    }
  }
}

module.exports = ExtensionServer;
