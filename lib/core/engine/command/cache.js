import { getLogger } from '@sitespeed.io/log';
const log = getLogger('browsertime.command.cache');
/**
 * Manage the browser cache.
 * This class provides methods to clear the cache and cookies in different browsers.
 *
 * @class
 * @hideconstructor
 */
export class Cache {
  constructor(browser, browserName, cdp) {
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
    this.cdp = cdp;
  }

  /**
   * Clears the browser cache. This includes both cache and cookies.
   *
   * For Chrome and Edge, it uses the Chrome DevTools Protocol (CDP) commands.
   * If the browser is not supported, logs an error message.
   *
   * @async
   * @example await commands.cache.clear();
   * @throws Will throw an error if the browser is not supported.
   * @returns {Promise<void>} A promise that resolves when the cache and cookies are cleared.
   */
  async clear() {
    if (this.browserName === 'chrome' || this.browserName === 'edge') {
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
   * For Chrome and Edge, it uses the Chrome DevTools Protocol (CDP) command to clear the cache.
   * If the browser is not supported, logs an error message.
   *
   * @async
   * @example await commands.cache.clearKeepCookies();
   * @throws Will throw an error if the browser is not supported.
   * @returns {Promise<void>} A promise that resolves when the cache is cleared but cookies are kept.
   */
  async clearKeepCookies() {
    if (this.browserName === 'chrome' || this.browserName === 'edge') {
      await this.cdp.send('Network.enable');
      return this.cdp.send('Network.clearBrowserCache');
    } else {
      log.error(this.browserName + ' do not support clearing the cache');
    }
  }
}
