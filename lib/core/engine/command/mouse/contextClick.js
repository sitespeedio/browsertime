'use strict';

const log = require('intel').getLogger('browsertime.command.mouse');
const webdriver = require('selenium-webdriver');

class ContextClick {
  constructor(browser) {
    this.driver = browser.getDriver();
    this.actions = this.driver.actions({ async: true });
  }

  /**
   * Perform ContextClick on an element that matches a XPath selector.
   * @param {string} xpath
   * @returns {Promise} Promise object represents when context click occurs.
   * @throws Will throw an error if the element is not found
   */
  async byXpath(xpath) {
    try {
      const element = await this.driver.findElement(webdriver.By.xpath(xpath));
      return this.actions.contextClick(element).perform();
    } catch (e) {
      log.error('Could not context click on element with xpath %s', xpath);
      log.verbose(e);
      throw Error('Could not context click on element with xpath ' + xpath);
    }
  }

  /**
   * Perform ContextClick on an element that matches a CSS selector.
   * @param {string} css selector
   * @returns {Promise} Promise object represents when context click occurs.
   * @throws Will throw an error if the element is not found
   */
  async bySelector(selector) {
    try {
      const element = await this.driver.findElement(webdriver.By.css(selector));
      return this.actions.contextClick(element).perform();
    } catch (e) {
      log.error('Could not context click on element with css %s', selector);
      log.verbose(e);
      throw Error('Could not context click on element with css ' + selector);
    }
  }

  /**
   * Perform ContextClick at the cursor's position.
   * @returns {Promise} Promise object represents when context click occurs.
   * @throws Will throw an error if context click cannot be performed.
   */
  async atCursor() {
    try {
      return this.actions.contextClick().perform();
    } catch (e) {
      log.error('Could not perform context click');
      log.verbose(e);
      throw Error('Could not perform context click');
    }
  }
}
module.exports = ContextClick;
