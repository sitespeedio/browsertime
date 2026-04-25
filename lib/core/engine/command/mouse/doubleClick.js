import { getLogger } from '@sitespeed.io/log';
import { By } from 'selenium-webdriver';
import webdriver from 'selenium-webdriver';
import { executeCommand } from '../commandHelper.js';
import { parseSelector } from '../selectorParser.js';
const log = getLogger('browsertime.command.mouse');
/**
 * Provides functionality to perform a double-click action on elements in a web page.
 *
 * @class
 * @hideconstructor
 */
export class DoubleClick {
  constructor(browser, pageCompleteCheck, options) {
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
    /**
     * @private
     */
    this.options = options;
  }

  /**
   * @private
   */
  async _waitForElement(driver, locator) {
    const timeout = this.options?.timeouts?.elementWait ?? 0;
    if (timeout > 0) {
      await driver.wait(webdriver.until.elementLocated(locator), timeout);
    }
  }

  /**
   * Performs a double click on an element using a unified selector string.
   *
   * @async
   * @param {string} selector - The selector string. CSS by default, or use a prefix.
   * @returns {Promise<void>}
   * @throws {Error} Throws an error if the element is not found.
   */
  async run(selector) {
    const { locator, description } = parseSelector(selector);
    return executeCommand(
      log,
      'Could not double click on element %s',
      description,
      async () => {
        const driver = this.browser.getDriver();
        await this._waitForElement(driver, locator);
        const element = await driver.findElement(locator);
        await this.actions.doubleClick(element).perform();
        await this.actions.clear();
      },
      this.browser
    );
  }

  /**
   * @private
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
      await this.actions.clear();
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
   * @private
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
      await this.actions.clear();
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
   * @private
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
      await this.actions.clear();
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
