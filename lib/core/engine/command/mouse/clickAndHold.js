import { getLogger } from '@sitespeed.io/log';
import { By, Origin } from 'selenium-webdriver';
const log = getLogger('browsertime.command.mouse');

/**
 * Provides functionality to click and hold elements on a web page using different strategies.
 *
 * @class
 * @hideconstructor
 */
export class ClickAndHold {
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
   * Clicks and holds on an element that matches a given XPath selector.
   *
   * @async
   * @param {string} xpath - The XPath selector of the element to interact with.
   * @returns {Promise<void>} A promise that resolves when the action is performed.
   * @throws {Error} Throws an error if the element is not found.
   */
  async byXpath(xpath) {
    try {
      const element = await this.driver.findElement(By.xpath(xpath));
      return this.actions.move({ origin: element }).press().perform();
    } catch (error) {
      log.error('Could not click and hold on element with xpath %s', xpath);
      log.verbose(error);
      throw new Error(
        'Could not click and hold on element with xpath ' + xpath
      );
    }
  }

  /**
   * Clicks and holds on an element that matches a given CSS selector.
   *
   * @async
   * @param {string} selector - The CSS selector of the element to interact with.
   * @returns {Promise<void>} A promise that resolves when the action is performed.
   * @throws {Error} Throws an error if the element is not found.
   */
  async bySelector(selector) {
    try {
      const element = await this.driver.findElement(By.css(selector));
      return this.actions.move({ origin: element }).press().perform();
    } catch (error) {
      log.error(
        'Could not click and hold on element with selector %s',
        selector
      );
      log.verbose(error);
      throw new Error(
        'Could not click and hold on element with selector ' + selector
      );
    }
  }

  /**
   * Clicks and holds at the current cursor position.
   *
   * @async
   * @returns {Promise<void>} A promise that resolves when the action is performed.
   * @throws {Error} Throws an error if the action cannot be performed.
   */
  async atCursor() {
    try {
      return this.actions.move({ origin: Origin.POINTER }).press().perform();
    } catch (error) {
      log.error('Could not click and hold at cursor');
      log.verbose(error);
      throw new Error('Could not click and hold at cursor');
    }
  }

  /**
   * Clicks and holds at the specified screen coordinates.
   *
   * @async
   * @param {number} xPos - The x-coordinate on the screen.
   * @param {number} yPos - The y-coordinate on the screen.
   * @returns {Promise<void>} A promise that resolves when the action is performed.
   * @throws {Error} Throws an error if the action cannot be performed.
   */
  async atPosition(xPos, yPos) {
    try {
      return this.actions
        .move({ x: xPos, y: yPos, origin: Origin.VIEWPORT })
        .press()
        .perform();
    } catch (error) {
      log.error('Could not click and hold at position (%d,%d)', xPos, yPos);
      log.verbose(error);
      throw new Error(
        'Could not click and hold at position (' + xPos + ',' + yPos + ')'
      );
    }
  }

  /**
   * Releases the mouse button on an element matching the specified XPath.
   *
   * @async
   * @param {string} xpath - The XPath selector of the element to release the mouse on.
   * @returns {Promise<void>} A promise that resolves when the action is performed.
   * @throws {Error} Throws an error if the action cannot be performed.
   */
  async releaseAtXpath(xpath) {
    try {
      const element = await this.driver.findElement(By.xpath(xpath));
      return this.actions.move({ origin: element }).release().perform();
    } catch (error) {
      log.error('Could not release on xpath %s', xpath);
      log.verbose(error);
      throw new Error('Could not release on xpath ' + xpath);
    }
  }

  /**
   * Releases the mouse button on an element matching the specified CSS selector.
   *
   * @async
   * @param {string} selector - The CSS selector of the element to release the mouse on.
   * @returns {Promise<void>} A promise that resolves when the action is performed.
   * @throws {Error} Throws an error if the action cannot be performed.
   */
  async releaseAtSelector(selector) {
    try {
      const element = await this.driver.findElement(By.css(selector));
      return this.actions.move({ origin: element }).release().perform();
    } catch (error) {
      log.error('Could not release on selector %s', selector);
      log.verbose(error);
      throw new Error('Could not release on selector ' + selector);
    }
  }

  /**
   * Releases the mouse button at the specified screen coordinates.
   *
   * @async
   * @param {number} xPos - The x-coordinate on the screen.
   * @param {number} yPos - The y-coordinate on the screen.
   * @returns {Promise<void>} A promise that resolves when the action is performed.
   * @throws {Error} Throws an error if the action cannot be performed.
   */
  async releaseAtPosition(xPos, yPos) {
    try {
      return this.actions
        .move({ x: xPos, y: yPos, origin: Origin.VIEWPORT })
        .release()
        .perform();
    } catch (error) {
      log.error('Could not release at position (%d,%d)', xPos, yPos);
      log.verbose(error);
      throw new Error(
        'Could not release at position (' + xPos + ',' + yPos + ')'
      );
    }
  }
}
