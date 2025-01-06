import { getLogger } from '@sitespeed.io/log';
import { By } from 'selenium-webdriver';
const log = getLogger('browsertime.command.mouse');

/**
 * Provides functionality to perform a context click (right-click) on elements in a web page.
 *
 * @class
 * @hideconstructor
 */
export class ContextClick {
  constructor(browser) {
    /**
     * @private
     */
    this.driver = browser.getDriver();
    /**
     * @private
     */
    this.actions = this.driver.actions({ async: true });
  }

  /**
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
      return this.actions.contextClick(element).perform();
    } catch (error) {
      log.error('Could not context click on element with xpath %s', xpath);
      log.verbose(error);
      throw new Error('Could not context click on element with xpath ' + xpath);
    }
  }

  /**
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
      return this.actions.contextClick(element).perform();
    } catch (error) {
      log.error('Could not context click on element with css %s', selector);
      log.verbose(error);
      throw new Error(
        'Could not context click on element with css ' + selector
      );
    }
  }

  /**
   * Performs a context click (right-click) at the current cursor position.
   *
   * @async
   * @returns {Promise<void>} A promise that resolves when the context click action is performed.
   * @throws {Error} Throws an error if the context click action cannot be performed.
   */
  async atCursor() {
    try {
      return this.actions.contextClick().perform();
    } catch (error) {
      log.error('Could not perform context click');
      log.verbose(error);
      throw new Error('Could not perform context click');
    }
  }
}
