import { startServer, stopServer } from './httpServer.js';
import { setup } from './setup.js';

/**
 * Create a ExtensionServer. The extension server helps us with
 * running the Browsertime extension, making it possible to
 * use a WebExtension to prepare our tests.
 * @class
 */
export class ExtensionServer {
  constructor(options) {
    this.options = options;
  }

  _useServer(newOptions) {
    const options = newOptions || this.options;
    return options.browser === 'firefox' &&
      (options.cacheClearRaw || options.block || options.clearCacheKeepCookies)
      ? true
      : false;
  }

  async _start() {
    if (!this.extensionServer) {
      this.extensionServer = await startServer();
    }
  }

  async _stop() {
    if (this.extensionServer) {
      await stopServer(this.extensionServer);
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
