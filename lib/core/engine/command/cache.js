'use strict';

const log = require('intel').getLogger('browsertime.command.cache');
class Cache {
  constructor(browser, browserName, extensionServer, cdp) {
    this.browser = browser;
    this.browserName = browserName;
    this.extensionServer = extensionServer;
    this.cdp = cdp;
  }

  /**
   * Clear the browser cache. Will clear browser cache and cookies.
   */
  async clear() {
    if (this.browserName === 'firefox') {
      const options = {
        cacheClearRaw: true,
        browser: 'firefox'
      };
      return this.extensionServer.setup(undefined, this.browser, options);
    } else if (this.browserName === 'chrome' || this.browserName === 'edge') {
      await this.cdp.send('Network.enable');
      await this.cdp.send('Network.clearBrowserCache');
      return this.cdp.send('Network.clearBrowserCookies');
    } else {
      log.error(this.browserName + ' do not support clearing the cache');
    }
  }

  /**
   * Clear the browser cache but keep cookies.
   */
  async clearKeepCookies() {
    if (this.browserName === 'firefox') {
      const options = {
        clearCacheKeepCookies: true,
        browser: 'firefox'
      };
      return this.extensionServer.setup(undefined, this.browser, options);
    } else if (this.browserName === 'chrome' || this.browserName === 'edge') {
      await this.cdp.send('Network.enable');
      return this.cdp.send('Network.clearBrowserCache');
    } else {
      log.error(this.browserName + ' do not support clearing the cache');
    }
  }
}
module.exports = Cache;
