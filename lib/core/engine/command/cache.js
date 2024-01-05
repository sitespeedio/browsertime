import intel from 'intel';
const log = intel.getLogger('browsertime.command.cache');
/**
 * Manage the browser cache.
 * This class provides methods to clear the cache and cookies in different browsers.
 *
 * @class
 * @hideconstructor
 */
export class Cache {
  constructor(browser, browserName, extensionServer, cdp) {
    /**
     * @private
     */
    this.browser = browser;
    /**
     * @private
     */
    this.browserName = browserName;
    /**
     * @private
     */
    this.extensionServer = extensionServer;
    /**
     * @private
     */
    this.cdp = cdp;
  }

  /**
   * Clears the browser cache. This includes both cache and cookies.
   *
   * For Firefox, it uses the extensionServer setup with specific options.
   * For Chrome and Edge, it uses the Chrome DevTools Protocol (CDP) commands.
   * If the browser is not supported, logs an error message.
   *
   * @async
   * @throws Will throw an error if the browser is not supported.
   * @returns {Promise<void>} A promise that resolves when the cache and cookies are cleared.
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
   * Clears the browser cache while keeping the cookies.
   *
   * For Firefox, it uses the extensionServer setup with specific options.
   * For Chrome and Edge, it uses the Chrome DevTools Protocol (CDP) command to clear the cache.
   * If the browser is not supported, logs an error message.
   *
   * @async
   * @throws Will throw an error if the browser is not supported.
   * @returns {Promise<void>} A promise that resolves when the cache is cleared but cookies are kept.
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
