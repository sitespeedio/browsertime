'use strict';

const server = require('../../support/extensionServer');
const Promise = require('bluebird');
const extensionSetup = require('../../support/extensionSetup');

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

  start() {
    return server.startServer().then(server => (this.extensionServer = server));
  }

  stop() {
    if (this.extensionServer) {
      return server.stopServer(this.extensionServer);
    } else return Promise.resolve();
  }

  /**
   * Run the extension but only if the options match what the
   * extension handles.
   */
  setupExtension(taskOptions) {
    // always start with running our extension for the setup
    if (
      this.options.cacheClearRaw ||
      this.options.requestheader ||
      this.options.block ||
      this.options.basicAuth
    ) {
      const port = this.extensionServer.address().port;
      return extensionSetup(port, taskOptions);
    } else return Promise.resolve();
  }
}

module.exports = ExtensionServer;
