'use strict';

const log = require('intel').getLogger('browsertime.command.mouse');
const webdriver = require('selenium-webdriver');

class ClickAndHold {
  constructor(browser) {
    this.driver = browser.getDriver();
    this.actions = this.driver.actions({ async: true });
  }

  /**
   * Click and hold an element that matches a XPath selector.
   * @param {string} xpath
   * @returns {Promise} Promise object represents when mouse is pressed.
   * @throws Will throw an error if the element is not found.
   */
  async byXpath(xpath) {
    try {
      const element = await this.driver.findElement(webdriver.By.xpath(xpath));
      return this.actions.move({ origin: element }).press().perform();
    } catch (e) {
      log.error('Could not click and hold on element with xpath %s', xpath);
      log.verbose(e);
      throw Error('Could not click and hold on element with xpath ' + xpath);
    }
  }

  /**
   * Click and hold an element that matches a CSS selector.
   * @param {string} selector
   * @returns {Promise} Promise object represents when mouse is pressed.
   * @throws Will throw an error if the element is not found.
   */
  async bySelector(selector) {
    try {
      const element = await this.driver.findElement(webdriver.By.css(selector));
      return this.actions.move({ origin: element }).press().perform();
    } catch (e) {
      log.error(
        'Could not click and hold on element with selector %s',
        selector
      );
      log.verbose(e);
      throw Error(
        'Could not click and hold on element with selector ' + selector
      );
    }
  }

  /**
   * Click and hold an element at the cursor's position.
   * @returns {Promise} Promise object represents when mouse is pressed.
   * @throws Will throw an error if action cannot be performed.
   */
  async atCursor() {
    try {
      return this.actions
        .move({ origin: webdriver.Origin.POINTER })
        .press()
        .perform();
    } catch (e) {
      log.error('Could not click and hold at cursor');
      log.verbose(e);
      throw Error('Could not click and hold at cursor');
    }
  }

  /**
   * Click and hold an element at the given coordinates.
   * @param {integer} xPos
   * @param {integer} yPos
   * @returns {Promise} Promise object represents when mouse is pressed.
   * @throws Will throw an error if action cannot be performed.
   */
  async atPosition(xPos, yPos) {
    try {
      return this.actions
        .move({ x: xPos, y: yPos, origin: webdriver.Origin.VIEWPORT })
        .press()
        .perform();
    } catch (e) {
      log.error('Could not click and hold at position (%d,%d)', xPos, yPos);
      log.verbose(e);
      throw Error(
        'Could not click and hold at position (' + xPos + ',' + yPos + ')'
      );
    }
  }

  /**
   * Release mouse on element that matches the specified Xpath.
   * @param {string} xpath
   * @returns {Promise} Promise object represents when mouse is released.
   * @throws Will throw an error if action cannot be performed.
   */
  async releaseAtXpath(xpath) {
    try {
      const element = await this.driver.findElement(webdriver.By.xpath(xpath));
      return this.actions.move({ origin: element }).release().perform();
    } catch (e) {
      log.error('Could not release on xpath %s', xpath);
      log.verbose(e);
      throw Error('Could not release on xpath ' + xpath);
    }
  }

  /**
   * Release mouse on element that matches the specified CSS selector.
   * @param {string} selector
   * @returns {Promise} Promise object represents when mouse is released.
   * @throws Will throw an error if action cannot be performed.
   */
  async releaseAtSelector(selector) {
    try {
      const element = await this.driver.findElement(webdriver.By.css(selector));
      return this.actions.move({ origin: element }).release().perform();
    } catch (e) {
      log.error('Could not release on selector %s', selector);
      log.verbose(e);
      throw Error('Could not release on selector ' + selector);
    }
  }

  /**
   * Release mouse at specified coordinates.
   * @param {integer} xPos
   * @param {integer} yPos
   * @returns {Promise} Promise object represents when mouse is released.
   * @throws Will throw an error if action cannot be performed.
   */
  async releaseAtPosition(xPos, yPos) {
    try {
      return this.actions
        .move({ x: xPos, y: yPos, origin: webdriver.Origin.VIEWPORT })
        .release()
        .perform();
    } catch (e) {
      log.error('Could not release at position (%d,%d)', xPos, yPos);
      log.verbose(e);
      throw Error('Could not release at position (' + xPos + ',' + yPos + ')');
    }
  }
}

module.exports = ClickAndHold;
