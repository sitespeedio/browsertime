import { getLogger } from '@sitespeed.io/log';
import { By } from 'selenium-webdriver';
import webdriver from 'selenium-webdriver';
import { executeCommand } from '../commandHelper.js';
import { parseSelector } from '../selectorParser.js';
const log = getLogger('browsertime.command.mouse');

/**
 * Provides functionality to perform a context click (right-click) on elements in a web page.
 *
 * @class
 * @hideconstructor
 */
export class ContextClick {
  constructor(browser, options) {
    /**
     * @private
     */
    this.browser = browser;
    /**
     * @private
     */
    this.driver = browser.getDriver();
    /**
     * @private
     */
    this.actions = this.driver.actions({ async: true });
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
   * Performs a context click (right-click) on an element using a unified selector string.
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
      'Could not context click on element %s',
      description,
      async () => {
        const driver = this.browser.getDriver();
        await this._waitForElement(driver, locator);
        const element = await driver.findElement(locator);
        await this.actions.contextClick(element).perform();
        await this.actions.clear();
      },
      this.browser
    );
  }

  /**
   * @private
   * Performs a context click (right-click) on an element that matches a given XPath selector.
   *
   * @async
   * @param {string} xpath - The XPath selector of the element to context click.
   * @returns {Promise<void>} A promise that resolves when the context click action is performed.
   * @throws {Error} Throws an error if the element is not found.
   */
  async byXpath(xpath) {
    try {
      const element = await this.driver.findElement(By.xpath(xpath));
      await this.actions.contextClick(element).perform();
      return this.actions.clear();
    } catch (error) {
      log.error('Could not context click on element with xpath %s', xpath);
      log.verbose(error);
      throw new Error('Could not context click on element with xpath ' + xpath);
    }
  }

  /**
   * @private
   * Performs a context click (right-click) on an element that matches a given CSS selector.
   *
   * @async
   * @param {string} selector - The CSS selector of the element to context click.
   * @returns {Promise<void>} A promise that resolves when the context click action is performed.
   * @throws {Error} Throws an error if the element is not found.
   */
  async bySelector(selector) {
    try {
      const element = await this.driver.findElement(By.css(selector));
      await this.actions.contextClick(element).perform();
      return this.actions.clear();
    } catch (error) {
      log.error('Could not context click on element with css %s', selector);
      log.verbose(error);
      throw new Error(
        'Could not context click on element with css ' + selector
      );
    }
  }

  /**
   * @private
   * Performs a context click (right-click) at the current cursor position.
   *
   * @async
   * @returns {Promise<void>} A promise that resolves when the context click action is performed.
   * @throws {Error} Throws an error if the context click action cannot be performed.
   */
  async atCursor() {
    try {
      await this.actions.contextClick().perform();
      return this.actions.clear();
    } catch (error) {
      log.error('Could not perform context click');
      log.verbose(error);
      throw new Error('Could not perform context click');
    }
  }
}
