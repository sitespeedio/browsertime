import { getLogger } from '@sitespeed.io/log';
const log = getLogger('browsertime.command.navigation');

/**
 * Provides functionality to control browser navigation such as back, forward, and refresh actions.
 *
 * @class
 * @hideconstructor
 */

export class Navigation {
  constructor(browser, pageCompleteCheck) {
    /**
     * @private
     */
    this.browser = browser;
    /**
     * @private
     */
    this.pageCompleteCheck = pageCompleteCheck;
  }

  /**
   * Navigates backward in the browser's history.
   *
   * @async
   * @example await commands.navigation.back();
   * @param {Object} [options] - Additional options for navigation. Set {wait:true} to wait for the page complete check to run.
   * @returns {Promise<void>} A promise that resolves when the navigation action is completed.
   * @throws {Error} Throws an error if navigation fails.
   */
  async back(options) {
    const driver = this.browser.getDriver();
    try {
      await driver.navigate().back();
      if (options && 'wait' in options && options.wait == true) {
        return this.browser.extraWait(this.pageCompleteCheck);
      }
    } catch (error) {
      log.error('Could not navigate back');
      log.verbose(error);
      throw new Error(`Could not navigate back`);
    }
  }

  /**
   * Navigates forward in the browser's history.
   *
   * @async
   * @example await commands.navigation.forward();
   * @param {Object} [options] - Additional options for navigation. Set {wait:true} to wait for the page complete check to run.
   * @returns {Promise<void>} A promise that resolves when the navigation action is completed.
   * @throws {Error} Throws an error if navigation fails.
   */
  async forward(options) {
    const driver = this.browser.getDriver();
    try {
      await driver.navigate().forward();
      if (options && 'wait' in options && options.wait === true) {
        return this.browser.extraWait(this.pageCompleteCheck);
      }
    } catch (error) {
      log.error('Could not navigate forward');
      log.verbose(error);
      throw new Error(`Could not navigate forward`);
    }
  }

  /**
   * Refreshes the current page.
   *
   * @async
   * @example await commands.navigation.refresh();
   * @param {Object} [options] - Additional options for refresh action. Set {wait:true} to wait for the page complete check to run.
   * @returns {Promise<void>} A promise that resolves when the page has been refreshed.
   * @throws {Error} Throws an error if refreshing the page fails.
   */
  async refresh(options) {
    const driver = this.browser.getDriver();
    try {
      await driver.navigate().refresh();
      if (options && 'wait' in options && options.wait === true) {
        return this.browser.extraWait(this.pageCompleteCheck);
      }
    } catch (error) {
      log.error('Could not refresh page');
      log.verbose(error);
      throw new Error(`Could not refresh page`);
    }
  }
}
