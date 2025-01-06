import { getLogger } from '@sitespeed.io/log';
import { By, Origin } from 'selenium-webdriver';
const log = getLogger('browsertime.command.mouse');
/**
 * Provides functionality to move the mouse cursor to elements or specific positions on a web page.
 *
 * @class
 * @hideconstructor
 */
export class MouseMove {
  constructor(browser) {
    /**
     * @private
     */
    this.driver = browser.getDriver();
    /**
     * @private
     */
    this.actions = this.driver.actions({ async: true });
  }

  /**
   * Moves the mouse cursor to an element that matches a given XPath selector.
   *
   * @async
   * @param {string} xpath - The XPath selector of the element to move to.
   * @returns {Promise<void>} A promise that resolves when the mouse has moved to the element.
   * @throws {Error} Throws an error if the element is not found.
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
   * Moves the mouse cursor to an element that matches a given CSS selector.
   *
   * @async
   * @param {string} selector - The CSS selector of the element to move to.
   * @returns {Promise<void>} A promise that resolves when the mouse has moved to the element.
   * @throws {Error} Throws an error if the element is not found.
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
   * Moves the mouse cursor to a specific position on the screen.
   *
   * @async
   * @param {number} xPos - The x-coordinate on the screen to move to.
   * @param {number} yPos - The y-coordinate on the screen to move to.
   * @returns {Promise<void>} A promise that resolves when the mouse has moved to the specified position.
   * @throws {Error} Throws an error if the action cannot be performed.
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
   * Moves the mouse cursor by an offset from its current position.
   *
   * @async
   * @param {number} xOffset - The x offset to move by.
   * @param {number} yOffset - The y offset to move by.
   * @returns {Promise<void>} A promise that resolves when the mouse has moved by the specified offset.
   * @throws {Error} Throws an error if the action cannot be performed.
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
