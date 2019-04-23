'use strict';

const log = require('intel').getLogger('browsertime.command.set');

class Set {
  constructor(browser) {
    this.browser = browser;
  }

  /**
   * Set innerHtml to an element using a specific CSS selector.
   * @param {string} html The html string that you want to set
   * @param {string} selector The selector of the element
   * @returns {Promise} Promise object represents when the html has been
   * set to the element
   * @throws Will throw an error if the element is not found
   */
  async innerHtml(html, selector) {
    try {
      const script = `document.querySelector('${selector}').innerHTML = '${html}';`;
      await this.browser.runScript(script, 'CUSTOM');
    } catch (e) {
      log.error('Could not set inner HTML %s for selector %s', html, selector);
      log.verbose(e);
      throw Error(`Could not set inner HTML ${html} for selector ${selector}`);
    }
  }

  /**
   * Set innerHtml to an element using a id
   * @param {string} html The html string that you want to set
   * @param {string} id The id of the element
   * @returns {Promise} Promise object represents when the html has been
   * set to the element
   * @throws Will throw an error if the element is not found
   */
  async innerHtmlById(html, id) {
    try {
      const script = `document.getElementById('${id}').innerHTML = '${html}';`;
      await this.browser.runScript(script, 'CUSTOM');
    } catch (e) {
      log.error('Could not set inner HTML %s for id %s', html, id);
      log.verbose(e);
      throw Error(`Could not set inner HTML ${html} for id ${id}`);
    }
  }

  /**
   * Set innerText to an element using a specific CSS selector.
   * @param {string} html The html string that you want to set
   * @param {string} selector The selector of the element
   * @returns {Promise} Promise object represents when the text has been
   * set to the element
   * @throws Will throw an error if the element is not found
   */
  async innerText(text, selector) {
    try {
      const script = `document.querySelector('${selector}').innerText = '${text}';`;
      await this.browser.runScript(script, 'CUSTOM');
    } catch (e) {
      log.error('Could not set inner text %s for selector %s', text, selector);
      log.verbose(e);
      throw Error(`Could not set inner text ${text} for selector ${selector}`);
    }
  }

  /**
   * Set innerText to an element using a id.
   * @param {string} html The html string that you want to set
   * @param {string} id The id of the element
   * @returns {Promise} Promise object represents when the text has been
   * set to the element
   * @throws Will throw an error if the element is not found
   */
  async innerTextById(text, id) {
    try {
      const script = `document.getElementById('${id}').innerText = '${text}';`;
      await this.browser.runScript(script, 'CUSTOM');
    } catch (e) {
      log.error('Could not set inner text %s for id %s', text, id);
      log.verbose(e);
      throw Error(`Could not set inner text ${text} for id ${id}`);
    }
  }

  /**
   * Set value to an element using a specific CSS selector.
   * @param {string} value The value that you want to set
   * @param {string} selector The selector of the element
   * @returns {Promise} Promise object represents when the value has been
   * added to element
   * @throws Will throw an error if the element is not found
   */
  async value(value, selector) {
    try {
      const script = `document.querySelector('${selector}').value = '${value}';`;
      await this.browser.runScript(script, 'CUSTOM');
    } catch (e) {
      log.error('Could not set value %s for selector %s', value, selector);
      log.verbose(e);
      throw Error(`Could not set value ${value} for selector ${selector}`);
    }
  }

  /**
   * Set value to an element using a id.
   * @param {string} value The value that you want to set
   * @param {string} selector The selector of the element
   * @returns {Promise} Promise object represents when the value has been
   * added to element
   * @throws Will throw an error if the element is not found
   */
  async valueById(value, id) {
    try {
      const script = `document.getElementById('${id}').value= '${value}';`;
      await this.browser.runScript(script, 'CUSTOM');
    } catch (e) {
      log.error('Could not set value %s for id %s', value, id);
      log.verbose(e);
      throw Error(`Could not set value ${value} for id ${id}`);
    }
  }
}
module.exports = Set;
