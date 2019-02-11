'use strict';

class Cache {
  constructor(browser, extensionServer) {
    this.browser = browser;
    this.extensionServer = extensionServer;
  }

  /**
   * Clear the browser cache. Will clear browser cache and cookies.
   */
  async clear() {
    return this.extensionServer.setupExtension(undefined, this.browser, {
      cacheClearRaw: true
    });
  }

  /**
   * Clear the browser cache but keep cookies.
   */
  async clearKeepCookies() {
    return this.extensionServer.setupExtension(undefined, this.browser, {
      clearCacheKeepCookies: true
    });
  }
}
module.exports = Cache;
