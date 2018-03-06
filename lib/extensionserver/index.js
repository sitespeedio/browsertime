'use strict';

const server = require('./server');
const extensionSetup = require('./extensionSetup');

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
    this.extensionServer = await server.startServer();
  }

  async stop() {
    if (this.extensionServer) {
      await server.stopServer(this.extensionServer);
    }
  }

  /**
   * Run the extension but only if the options match what the
   * extension handles.
   */
  async setupExtension(url, driver) {
    // always start with running our extension for the setup
    if (
      this.options.cacheClearRaw ||
      this.options.requestheader ||
      this.options.block ||
      this.options.basicAuth
    ) {
      const port = this.extensionServer.address().port;
      await extensionSetup(url, driver, port, this.options);
    }
  }
}

module.exports = ExtensionServer;
