'use strict';

const log = require('intel').getLogger('browsertime.command.cache');
class Cache {
  constructor(browser, extensionServer, cdp) {
    this.browser = browser;
    this.extensionServer = extensionServer;
    this.cdp = cdp;
  }

  /**
   * Clear the browser cache. Will clear browser cache and cookies.
   */
  async clear() {
    if (this.browser === 'firefox') {
      return this.extensionServer.setupExtension(undefined, this.browser, {
        cacheClearRaw: true
      });
    } else if (this.browser === 'chrome') {
      await this.cdp.send('Network.enable');
      await this.cdp.send('Network.clearBrowserCache');
      return this.cdp.send('Network.clearBrowserCookies');
    } else {
      log.error(this.browser + ' do not support clearing the cache');
    }
  }

  /**
   * Clear the browser cache but keep cookies.
   */
  async clearKeepCookies() {
    if (this.browser === 'firefox') {
      return this.extensionServer.setupExtension(undefined, this.browser, {
        clearCacheKeepCookies: true
      });
    } else if (this.browser === 'chrome') {
      await this.cdp.send('Network.enable');
      return this.cdp.send('Network.clearBrowserCache');
    } else {
      log.error(this.browser + ' do not support clearing the cache');
    }
  }
}
module.exports = Cache;
