'use strict';

const webdriver = require('selenium-webdriver');
const log = require('intel').getLogger('browsertime.command.addText');

class AddText {
  constructor(browser) {
    this.browser = browser;
  }

  /**
   * Add text to an element with Selenium sendKeys.
   * @param {string} text The text string that you want to add
   * @param {string} id The id of the element
   * @returns {Promise} Promise object represents when the text has been
   * added to the field
   * @throws Will throw an error if the element is not found
   */
  async byId(text, id) {
    const driver = this.browser.getDriver();
    try {
      const element = await driver.findElement(webdriver.By.id(id));
      // make sure we clear it
      await element.clear();
      return element.sendKeys(text);
    } catch (e) {
      log.error('Could not add text %s to id %s', text, id);
      log.verbose(e);
      throw e;
    }
  }

  /**
   * Add text to an element with Selenium sendKeys.
   * @param {string} text The text string that you want to add
   * @param {string} xpath The xpath to the element
   * @returns {Promise} Promise object represents when the text has been
   * added to the field
   * @throws Will throw an error if the element is not found
   */
  async byXpath(text, xpath) {
    const driver = this.browser.getDriver();
    try {
      const element = await driver.findElement(webdriver.By.xpath(xpath));
      // make sure we clear it
      await element.clear();
      return element.sendKeys(text);
    } catch (e) {
      log.error('Could not add text %s to xpath %s', text, xpath);
      log.verbose(e);
      throw e;
    }
  }
}
module.exports = AddText;
