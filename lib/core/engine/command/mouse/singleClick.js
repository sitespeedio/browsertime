'use strict';

const log = require('intel').getLogger('browsertime.command.mouse');
const webdriver = require('selenium-webdriver');

class SingleClick {
  constructor(browser, pageCompleteCheck) {
    this.browser = browser;
    this.actions = this.browser.getDriver().actions({ async: true });
    this.pageCompleteCheck = pageCompleteCheck;
  }

  /**
   * Perform mouse single click on an element matches a XPath selector.
   * @param {string} xpath
   * @returns {Promise} Promise object represents when the element has been clicked.
   * @throws Will throw an error if the element is not found.
   */
  async byXpath(xpath, options) {
    try {
      const element = await this.browser
        .getDriver()
        .findElement(webdriver.By.xpath(xpath));
      await this.actions.click(element).perform();
      if (options && 'wait' in options && options.wait === true) {
        return this.browser.extraWait(this.pageCompleteCheck);
      }
    } catch (e) {
      log.error('Could not single click on element with xpath %s', xpath);
      log.verbose(e);
      throw Error('Could not single click on element with xpath ' + xpath);
    }
  }

  /**
   * Perform mouse single click on an element matches a CSS selector.
   * @param {string} selector
   * @returns {Promise} Promise object represents when the element has been clicked.
   * @throws Will throw an error if the element is not found.
   */
  async bySelector(selector, options) {
    try {
      const element = await this.browser
        .getDriver()
        .findElement(webdriver.By.css(selector));
      await this.actions.click(element).perform();
      if (options && 'wait' in options && options.wait === true) {
        return this.browser.extraWait(this.pageCompleteCheck);
      }
    } catch (e) {
      log.error('Could not single click on element with selector %s', selector);
      log.verbose(e);
      throw Error(
        'Could not single click on element with selector ' + selector
      );
    }
  }

  /**
   * Perform mouse single click at the cursor's position.
   * @param {string} xpath
   * @returns {Promise} Promise object represents when double click occurs.
   * @throws Will throw an error if double click cannot be performed.
   */
  async atCursor(options) {
    try {
      await this.actions.click().perform();
      if (options && 'wait' in options && options.wait === true) {
        return this.browser.extraWait(this.pageCompleteCheck);
      }
    } catch (e) {
      log.error('Could not perform single click');
      log.verbose(e);
      throw Error('Could not perform single click');
    }
  }
}

module.exports = SingleClick;
