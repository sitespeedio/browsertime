import { By } from 'selenium-webdriver';
import { getLogger } from '@sitespeed.io/log';
const log = getLogger('browsertime.command.addText');

/**
 * Provides functionality to add text to elements on a web page using various selectors.
 * @class
 * @hideconstructor
 */
export class AddText {
  constructor(browser) {
    /**
     * @private
     */
    this.browser = browser;
  }

  /**
   * Adds text to an element identified by its ID.
   *
   * @async
   * @example commands.addText.byId('mytext', 'id');
   * @param {string} text - The text string to add.
   * @param {string} id - The ID of the element.
   * @returns {Promise<void>} A promise that resolves when the text has been added.
   * @throws {Error} Throws an error if the element is not found.
   */
  async byId(text, id) {
    const driver = this.browser.getDriver();
    try {
      const element = await driver.findElement(By.id(id));
      // make sure we clear it
      await element.clear();
      return element.sendKeys(text);
    } catch (error) {
      log.error(
        'Could not add text %s to id %s error:%s',
        text,
        id,
        error.message
      );
      log.verbose(error);
      throw new Error(`Could not add text ${text} to id ${id}`);
    }
  }

  /**
   * Adds text to an element identified by its XPath.
   *
   * @async
   * @example commands.addText.byXpath('mytext', 'xpath');
   * @param {string} text - The text string to add.
   * @param {string} xpath - The XPath of the element.
   * @returns {Promise<void>} A promise that resolves when the text has been added.
   * @throws {Error} Throws an error if the element is not found.
   */
  async byXpath(text, xpath) {
    const driver = this.browser.getDriver();
    try {
      const element = await driver.findElement(By.xpath(xpath));
      // make sure we clear it
      await element.clear();
      return element.sendKeys(text);
    } catch (error) {
      log.error(
        'Could not add text %s to xpath %s error: %s',
        text,
        xpath,
        error.message
      );
      log.verbose(error);
      throw new Error(`Could not add text ${text} to xpath ${xpath}`);
    }
  }

  /**
   * Adds text to an element identified by its CSS selector.
   *
   * @async
   * @example commands.addText.bySelector('mytext', 'selector');
   * @param {string} text - The text string to add.
   * @param {string} selector - The CSS selector of the element.
   * @returns {Promise<void>} A promise that resolves when the text has been added.
   * @throws {Error} Throws an error if the element is not found.
   */
  async bySelector(text, selector) {
    const driver = this.browser.getDriver();
    try {
      const element = await driver.findElement(By.css(selector));
      // make sure we clear it
      await element.clear();
      return element.sendKeys(text);
    } catch (error) {
      log.error(
        'Could not add text %s to selector %s error: %s',
        text,
        selector,
        error.message
      );
      log.verbose(error);
      throw new Error(`Could not add text ${text} to selector ${selector}`);
    }
  }

  /**
   * Adds text to an element identified by its class name.
   *
   * @async
   * @example commands.addText.byClassName('mytext', 'className');
   * @param {string} text - The text string to add.
   * @param {string} className - The class name of the element.
   * @returns {Promise<void>} A promise that resolves when the text has been added.
   * @throws {Error} Throws an error if the element is not found.
   */
  async byClassName(text, className) {
    const driver = this.browser.getDriver();
    try {
      const element = await driver.findElement(By.className(className));
      // make sure we clear it
      await element.clear();
      return element.sendKeys(text);
    } catch (error) {
      log.error(
        'Could not add text %s to class name %s error: %s',
        text,
        className,
        error.message
      );
      log.verbose(error);
      throw new Error(`Could not add text ${text} to class name ${className}`);
    }
  }

  /**
   * Adds text to an element identified by its name attribute.
   *
   * @async
   * @example commands.addText.byName('mytext', 'name');
   * @param {string} text - The text string to add.
   * @param {string} name - The name attribute of the element.
   * @returns {Promise<void>} A promise that resolves when the text has been added.
   * @throws {Error} Throws an error if the element is not found.
   */
  async byName(text, name) {
    const driver = this.browser.getDriver();
    try {
      const element = await driver.findElement(By.name(name));
      // make sure we clear it
      await element.clear();
      return element.sendKeys(text);
    } catch (error) {
      log.error(
        'Could not add text %s to name attribute %s error: %s',
        text,
        name,
        error.message
      );
      log.verbose(error);
      throw new Error(`Could not add text ${text} to name attribute ${name}`);
    }
  }
}
