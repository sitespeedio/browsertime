import webdriver from 'selenium-webdriver';
import { getLogger } from '@sitespeed.io/log';
import { parseSelector } from './selectorParser.js';
const log = getLogger('browsertime.command.set');

/**
 * Provides functionality to set properties like innerHTML, innerText, and value on elements in a web page.
 *
 * @class
 * @hideconstructor
 */
export class Set {
  constructor(browser, options) {
    /**
     * @private
     */
    this.browser = browser;
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
   * Sets a property on an element using a unified selector string.
   * Supports CSS selectors (default), and prefix-based strategies:
   * 'id:myId', 'xpath://input', 'name:field', 'class:input-field'.
   *
   * @async
   * @param {string} selector - The selector string for the element.
   * @param {string} value - The value to set.
   * @param {string} [property='value'] - The property to set: 'value', 'innerText', or 'innerHTML'.
   * @returns {Promise<void>} A promise that resolves when the property is set.
   * @throws {Error} Throws an error if the element is not found.
   */
  async run(selector, value, property = 'value') {
    const { locator, description } = parseSelector(selector);
    const driver = this.browser.getDriver();
    try {
      await this._waitForElement(driver, locator);
      const element = await driver.findElement(locator);
      await driver.executeScript(
        `arguments[0].${property} = '${value}';`,
        element
      );
    } catch (error) {
      log.error('Could not set %s on %s', property, description);
      log.verbose(error);
      throw new Error(`Could not set ${property} on ${description}`);
    }
  }

  /**
   * Sets the innerHTML of an element using a CSS selector.
   *
   * @async
   * @private
   * @param {string} html - The HTML string to set as innerHTML.
   * @param {string} selector - The CSS selector of the element.
   * @returns {Promise<void>} A promise that resolves when the innerHTML is set.
   * @throws {Error} Throws an error if the element is not found.
   */
  async innerHtml(html, selector) {
    try {
      const script = `document.querySelector('${selector}').innerHTML = '${html}';`;
      await this.browser.runScript(script, 'CUSTOM');
    } catch (error) {
      log.error('Could not set inner HTML %s for selector %s', html, selector);
      log.verbose(error);
      throw new Error(
        `Could not set inner HTML ${html} for selector ${selector}`
      );
    }
  }

  /**
   * Sets the innerHTML of an element using its ID.
   *
   * @async
   * @private
   * @param {string} html - The HTML string to set as innerHTML.
   * @param {string} id - The ID of the element.
   * @returns {Promise<void>} A promise that resolves when the innerHTML is set.
   * @throws {Error} Throws an error if the element is not found.
   */
  async innerHtmlById(html, id) {
    try {
      const script = `document.getElementById('${id}').innerHTML = '${html}';`;
      await this.browser.runScript(script, 'CUSTOM');
    } catch (error) {
      log.error('Could not set inner HTML %s for id %s', html, id);
      log.verbose(error);
      throw new Error(`Could not set inner HTML ${html} for id ${id}`);
    }
  }

  /**
   * Sets the innerText of an element using a CSS selector.
   *
   * @async
   * @private
   * @param {string} text - The text to set as innerText.
   * @param {string} selector - The CSS selector of the element.
   * @returns {Promise<void>} A promise that resolves when the innerText is set.
   * @throws {Error} Throws an error if the element is not found.
   */
  async innerText(text, selector) {
    try {
      const script = `document.querySelector('${selector}').innerText = '${text}';`;
      await this.browser.runScript(script, 'CUSTOM');
    } catch (error) {
      log.error('Could not set inner text %s for selector %s', text, selector);
      log.verbose(error);
      throw new Error(
        `Could not set inner text ${text} for selector ${selector}`
      );
    }
  }

  /**
   * Sets the innerText of an element using its ID.
   *
   * @async
   * @private
   * @param {string} text - The text to set as innerText.
   * @param {string} id - The ID of the element.
   * @returns {Promise<void>} A promise that resolves when the innerText is set.
   * @throws {Error} Throws an error if the element is not found.
   */
  async innerTextById(text, id) {
    try {
      const script = `document.getElementById('${id}').innerText = '${text}';`;
      await this.browser.runScript(script, 'CUSTOM');
    } catch (error) {
      log.error('Could not set inner text %s for id %s', text, id);
      log.verbose(error);
      throw new Error(`Could not set inner text ${text} for id ${id}`);
    }
  }

  /**
   * Sets the value of an element using a CSS selector.
   *
   * @async
   * @private
   * @param {string} value - The value to set on the element.
   * @param {string} selector - The CSS selector of the element.
   * @returns {Promise<void>} A promise that resolves when the value is set.
   * @throws {Error} Throws an error if the element is not found.
   */
  async value(value, selector) {
    try {
      const script = `document.querySelector('${selector}').value = '${value}';`;
      await this.browser.runScript(script, 'CUSTOM');
    } catch (error) {
      log.error('Could not set value %s for selector %s', value, selector);
      log.verbose(error);
      throw new Error(`Could not set value ${value} for selector ${selector}`);
    }
  }

  /**
   * Sets the value of an element using its ID.
   *
   * @async
   * @private
   * @param {string} value - The value to set on the element.
   * @param {string} id - The ID of the element.
   * @returns {Promise<void>} A promise that resolves when the value is set.
   * @throws {Error} Throws an error if the element is not found.
   */
  async valueById(value, id) {
    try {
      const script = `document.getElementById('${id}').value= '${value}';`;
      await this.browser.runScript(script, 'CUSTOM');
    } catch (error) {
      log.error('Could not set value %s for id %s', value, id);
      log.verbose(error);
      throw new Error(`Could not set value ${value} for id ${id}`);
    }
  }
}
