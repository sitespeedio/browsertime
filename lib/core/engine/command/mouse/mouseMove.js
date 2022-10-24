import intel from 'intel';
import { By, Origin } from 'selenium-webdriver';
const log = intel.getLogger('browsertime.command.mouse');
export class MouseMove {
  constructor(browser) {
    this.driver = browser.getDriver();
    this.actions = this.driver.actions({ async: true });
  }

  /**
   * Move mouse to an element that matches a XPath selector.
   * @param {string} xpath
   * @returns {Promise} Promise object represents when the mouse has moved
   * @throws Will throw an error if the element is not found
   */
  async byXpath(xpath) {
    try {
      const element = await this.driver.findElement(By.xpath(xpath));
      return this.actions.move({ origin: element }).perform();
    } catch (error) {
      log.error('Could not find element by xpath %s', xpath);
      log.verbose(error);
      throw new Error('Could not find element by xpath ' + xpath);
    }
  }

  /**
   * Move mouse to an element that matches a CSS selector.
   * @param {string} selector
   * @returns {Promise} Promise object represents when the mouse has moved
   * @throws Will throw an error if the element is not found
   */
  async bySelector(selector) {
    try {
      const element = await this.driver.findElement(By.css(selector));
      return this.actions.move({ origin: element }).perform();
    } catch (error) {
      log.error('Could not find element by selector %s', selector);
      log.verbose(error);
      throw new Error('Could not find element by selector ' + selector);
    }
  }

  /**
   * Move mouse to a position
   * @param {number} xPos, {number} yPos
   * @returns {Promise} Promise object represents when the mouse has moved
   * @throws Will throw an error if the element is not found
   */
  async toPosition(xPos, yPos) {
    try {
      return this.actions.move({ x: xPos, y: yPos }).perform();
    } catch (error) {
      log.error('Could not move mouse to position.');
      log.verbose(error);
      throw new Error('Could not move mouse to position.');
    }
  }

  /**
   * Move mouse by an offset
   * @param {number} xOffset, {number} yOffset
   * @returns {Promise} Promise object represents when the mouse has moved
   * @throws Will throw an error if the element is not found
   */
  async byOffset(xOffset, yOffset) {
    try {
      return this.actions
        .move({ x: xOffset, y: yOffset, origin: Origin.POINTER })
        .perform();
    } catch (error) {
      log.error('Could not move mouse by offset');
      log.verbose(error);
      throw new Error('Could not move mouse by offset');
    }
  }
}
