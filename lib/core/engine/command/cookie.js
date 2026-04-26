import { getLogger } from '@sitespeed.io/log';
const log = getLogger('browsertime.command.cookie');

/**
 * Provides functionality to manage browser cookies.
 *
 * @class
 * @hideconstructor
 */
export class Cookie {
  constructor(browser) {
    /**
     * @private
     */
    this.driver = browser.getDriver();
  }

  /**
   * Gets all cookies for the current page.
   *
   * @async
   * @returns {Promise<Array>} An array of cookie objects.
   */
  async getAll() {
    return this.driver.manage().getCookies();
  }

  /**
   * Gets a specific cookie by name.
   *
   * @async
   * @param {string} name - The name of the cookie.
   * @returns {Promise<Object|undefined>} The cookie object, or undefined if not found.
   */
  async get(name) {
    try {
      return await this.driver.manage().getCookie(name);
    } catch {
      // Cookie not found
    }
  }

  /**
   * Sets a cookie.
   *
   * @async
   * @param {string} name - The name of the cookie.
   * @param {string} value - The value of the cookie.
   * @param {Object} [options] - Optional cookie properties.
   * @param {string} [options.domain] - The domain the cookie is visible to.
   * @param {string} [options.path] - The cookie path.
   * @param {boolean} [options.secure] - Whether the cookie is secure.
   * @param {boolean} [options.httpOnly] - Whether the cookie is HTTP only.
   * @param {Date} [options.expiry] - When the cookie expires.
   * @returns {Promise<void>}
   */
  async set(name, value, options = {}) {
    const cookie = { name, value, ...options };
    log.debug('Setting cookie %s', name);
    return this.driver.manage().addCookie(cookie);
  }

  /**
   * Deletes a specific cookie by name.
   *
   * @async
   * @param {string} name - The name of the cookie to delete.
   * @returns {Promise<void>}
   */
  async delete(name) {
    log.debug('Deleting cookie %s', name);
    return this.driver.manage().deleteCookie(name);
  }

  /**
   * Deletes all cookies for the current page.
   *
   * @async
   * @returns {Promise<void>}
   */
  async deleteAll() {
    log.debug('Deleting all cookies');
    return this.driver.manage().deleteAllCookies();
  }
}
