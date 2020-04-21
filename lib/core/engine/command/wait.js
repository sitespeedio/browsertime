'use strict';

const webdriver = require('selenium-webdriver');
const log = require('intel').getLogger('browsertime.command.wait');
const delay = ms => new Promise(res => setTimeout(res, ms));

class Wait {
  constructor(browser, pageCompleteCheck) {
    this.browser = browser;
    this.pageCompleteCheck = pageCompleteCheck;
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
      throw Error(`Element by id ${id} was not located in ${time} ms`);
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
      throw Error(`Element by xpath ${xpath} was not located in ${time} ms`);
    }
  }

  /**
   * Wait for an element that you find by a selector to appear for maxTime.
   * @param {string} selector The selector to find the element to wait for
   * @param {number} maxTime Max time to wait in ms
   * @returns {Promise} Promise object represents when the element is found or the time times out
   * @throws Will throw an error if the element is not found
   */
  async bySelector(selector, maxTime) {
    const driver = this.browser.getDriver();
    const time = maxTime || 6000;

    try {
      await driver.wait(
        webdriver.until.elementLocated(webdriver.By.css(selector)),
        time
      );
    } catch (e) {
      log.error(
        'Element by selector %s was not located in %s ms',
        selector,
        time
      );
      log.verbose(e);
      throw Error(
        `Element by selector ${selector} was not located in ${time} ms`
      );
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

  /**
   * Wait for the page to finish loading.
   * @returns {Promise} Promise object represents when the pageCompleteCheck has finished.
   */
  async byPageToComplete() {
    return this.browser.extraWait(this.pageCompleteCheck);
  }
}
module.exports = Wait;
