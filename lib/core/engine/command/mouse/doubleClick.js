import { getLogger } from '@sitespeed.io/log';
import { By } from 'selenium-webdriver';
const log = getLogger('browsertime.command.mouse');
/**
 * Provides functionality to perform a double-click action on elements in a web page.
 *
 * @class
 * @hideconstructor
 */
export class DoubleClick {
  constructor(browser, pageCompleteCheck) {
    /**
     * @private
     */
    this.browser = browser;
    /**
     * @private
     */
    this.actions = this.browser.getDriver().actions({ async: true });
    /**
     * @private
     */
    this.pageCompleteCheck = pageCompleteCheck;
  }

  /**
   * Performs a mouse double-click on an element matching a given XPath selector.
   *
   * @async
   * @param {string} xpath - The XPath selector of the element to double-click.
   * @param {Object} [options] - Additional options for the double-click action.
   * @returns {Promise<void>} A promise that resolves when the double-click action is performed.
   * @throws {Error} Throws an error if the element is not found.
   */
  async byXpath(xpath, options) {
    try {
      const element = await this.browser
        .getDriver()
        .findElement(By.xpath(xpath));
      await this.actions.doubleClick(element).perform();
      if (options && 'wait' in options && options.wait === true) {
        return this.browser.extraWait(this.pageCompleteCheck);
      }
    } catch (error) {
      log.error('Could not double click on element with xpath %s', xpath);
      log.verbose(error);
      throw new Error('Could not double click on element with xpath ' + xpath);
    }
  }

  /**
   * Performs a mouse double-click on an element matching a given CSS selector.
   *
   * @async
   * @param {string} selector - The CSS selector of the element to double-click.
   * @param {Object} [options] - Additional options for the double-click action.
   * @returns {Promise<void>} A promise that resolves when the double-click action is performed.
   * @throws {Error} Throws an error if the element is not found.
   */
  async bySelector(selector, options) {
    try {
      const element = await this.browser
        .getDriver()
        .findElement(By.css(selector));
      await this.actions.doubleClick(element).perform();
      if (options && 'wait' in options && options.wait === true) {
        return this.browser.extraWait(this.pageCompleteCheck);
      }
    } catch (error) {
      log.error('Could not double click on element with xpath %s', selector);
      log.verbose(error);
      throw new Error(
        'Could not double click on element with xpath ' + selector
      );
    }
  }

  /**
   * Performs a mouse double-click at the current cursor position.
   *
   * @async
   * @param {Object} [options] - Additional options for the double-click action.
   * @returns {Promise<void>} A promise that resolves when the double-click occurs.
   * @throws {Error} Throws an error if the double-click action cannot be performed.
   */
  async atCursor(options) {
    try {
      await this.actions.doubleClick().perform();
      if (options && 'wait' in options && options.wait === true) {
        return this.browser.extraWait(this.pageCompleteCheck);
      }
    } catch (error) {
      log.error('Could not perform double click');
      log.verbose(error);
      throw new Error('Could not perform double click');
    }
  }
}
