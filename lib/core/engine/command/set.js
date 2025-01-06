import { getLogger } from '@sitespeed.io/log';
const log = getLogger('browsertime.command.set');

/**
 * Provides functionality to set properties like innerHTML, innerText, and value on elements in a web page.
 *
 * @class
 * @hideconstructor
 */
export class Set {
  constructor(browser) {
    /**
     * @private
     */
    this.browser = browser;
  }

  /**
   * Sets the innerHTML of an element using a CSS selector.
   *
   * @async
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
