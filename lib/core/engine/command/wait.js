'use strict';

const webdriver = require('selenium-webdriver');
const log = require('intel').getLogger('browsertime.command.wait');
const delay = ms => new Promise(res => setTimeout(res, ms));

class Wait {
  constructor(browser) {
    this.browser = browser;
  }

  /**
   * Wait for an element with id to appear for maxTime.
   * @param {string} id The id to wait for
   * @param {number} maxTime Max time to wait in ms
   * @returns {Promise} Promise object represents when the element is found or the time times out
   * @throws Will throw an error if the element is not found
   */
  async byId(id, maxTime) {
    const driver = this.browser.getDriver();
    const time = maxTime || 6000;

    try {
      await driver.wait(
        webdriver.until.elementLocated(webdriver.By.id(id)),
        time
      );
    } catch (e) {
      log.error('Element by id %s was not located in %s ms', id, time);
      log.verbose(e);
      throw e;
    }
  }

  /**
   * Wait for an element with xpath to appear for maxTime.
   * @param {string} xpath The xpath to wait for
   * @param {number} maxTime Max time to wait in ms
   * @returns {Promise} Promise object represents when the element is found or the time times out
   * @throws Will throw an error if the element is not found
   */
  async byXpath(xpath, maxTime) {
    const driver = this.browser.getDriver();
    const time = maxTime || 6000;

    try {
      await driver.wait(
        webdriver.until.elementLocated(webdriver.By.xpath(xpath)),
        time
      );
    } catch (e) {
      log.error('Element by xpath %s was not located in %s ms', xpath, time);
      log.verbose(e);
      throw e;
    }
  }

  /**
   * Wait for x ms.
   * @param {number} ms The tine in ms to wait.
   * @returns {Promise} Promise object represents when the time has timed out.
   */
  async byTime(ms) {
    return delay(ms);
  }
}
module.exports = Wait;
