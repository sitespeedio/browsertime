import { getLogger } from '@sitespeed.io/log';
import { By } from 'selenium-webdriver';
import { executeCommand } from './commandHelper.js';
const log = getLogger('browsertime.command.click');

/**
 * Provides functionality to perform click actions on elements in a web page using various selectors.
 *
 * @class
 * @hideconstructor
 */
export class Click {
  constructor(browser, pageCompleteCheck) {
    /**
     * @private
     */
    this.browser = browser;
    /**
     * @private
     */
    this.pageCompleteCheck = pageCompleteCheck;
  }

  /**
   * @private
   */
  async _andWait(baseMethod, ...args) {
    await baseMethod.apply(this, args);
    return this.browser.extraWait(this.pageCompleteCheck);
  }

  /**
   * @private
   */
  async _clickElement(element) {
    const driver = this.browser.getDriver();
    return driver.actions({ async: true }).click(element).perform();
  }

  /**
   * Clicks on an element identified by its class name.
   *
   * @async
   * @param {string} className - The class name of the element to click.
   * @returns {Promise<void>} A promise that resolves when the click action is performed.
   * @throws {Error} Throws an error if the element is not found.
   */
  async byClassName(className) {
    return executeCommand(
      log,
      'Could not find element by class name %s',
      className,
      async () => {
        const element = await this.browser
          .getDriver()
          .findElement(By.className(className));
        return this._clickElement(element);
      }
    );
  }

  /**
   * Clicks on an element identified by its class name and waits for the page complete check to finish.
   *
   * @async
   * @param {string} className - The class name of the element to click.
   * @returns {Promise<void>} A promise that resolves when the click action and page complete check are finished.
   * @throws {Error} Throws an error if the element is not found.
   */
  async byClassNameAndWait(className) {
    return this._andWait(this.byClassName, className);
  }

  /**
   * Clicks on a link whose visible text matches the given string.
   *
   * @async
   * @param {string} text - The visible text of the link to click.
   * @returns {Promise<void>} A promise that resolves when the click action is performed.
   * @throws {Error} Throws an error if the link is not found.
   */
  async byLinkText(text) {
    return executeCommand(log, 'Could not find link by text %s', text, () =>
      this.byXpath(`//a[text()='${text}']`)
    );
  }

  /**
   * Clicks on a link whose visible text matches the given string and waits for the page complete check to finish.
   *
   * @async
   * @param {string} text - The visible text of the link to click.
   * @returns {Promise<void>} A promise that resolves when the click action and page complete check are finished.
   * @throws {Error} Throws an error if the link is not found.
   */
  async byLinkTextAndWait(text) {
    return executeCommand(log, 'Could not find link by text %s', text, () =>
      this.byXpathAndWait(`//a[text()='${text}']`)
    );
  }

  /**
   * Clicks on a link whose visible text contains the given substring.
   *
   * @async
   * @param {string} text - The substring of the visible text of the link to click.
   * @returns {Promise<void>} A promise that resolves when the click action is performed.
   * @throws {Error} Throws an error if the link is not found.
   */
  async byPartialLinkText(text) {
    return executeCommand(
      log,
      'Could not find link by partial text %s',
      text,
      () => this.byXpath(`//a[contains(text(),'${text}')]`)
    );
  }

  /**
   * Clicks on a link whose visible text contains the given substring and waits for the page complete check to finish.
   *
   * @async
   * @param {string} text - The substring of the visible text of the link to click.
   * @returns {Promise<void>} A promise that resolves when the click action and page complete check are finished.
   * @throws {Error} Throws an error if the link is not found.
   */
  async byPartialLinkTextAndWait(text) {
    return executeCommand(
      log,
      'Could not find link by partial text %s',
      text,
      () => this.byXpathAndWait(`//a[contains(text(),'${text}')]`)
    );
  }

  /**
   * Clicks on an element that matches a given XPath selector.
   *
   * @async
   * @param {string} xpath - The XPath selector of the element to click.
   * @returns {Promise<void>} A promise that resolves when the click action is performed.
   * @throws {Error} Throws an error if the element is not found.
   */
  async byXpath(xpath) {
    return executeCommand(
      log,
      'Could not find element by xpath %s',
      xpath,
      async () => {
        const element = await this.browser
          .getDriver()
          .findElement(By.xpath(xpath));
        return this._clickElement(element);
      }
    );
  }
  /**
   * Clicks on an element that matches a given XPath selector and waits for the page complete check to finish.
   *
   * @async
   * @param {string} xpath - The XPath selector of the element to click.
   * @returns {Promise<void>} A promise that resolves when the click action and page complete check are finished.
   * @throws {Error} Throws an error if the element is not found.
   */
  async byXpathAndWait(xpath) {
    return this._andWait(this.byXpath, xpath);
  }

  /**
   * Clicks on an element located by evaluating a JavaScript expression.
   *
   * @async
   * @param {string} js - The JavaScript expression that evaluates to an element or list of elements.
   * @returns {Promise<void>} A promise that resolves when the click action is performed.
   * @throws {Error} Throws an error if the element is not found.
   */
  async byJs(js) {
    return executeCommand(
      log,
      'Could not find element by JavaScript %s',
      js,
      async () => {
        const trimmed = js.trim();
        const script = trimmed.endsWith(';')
          ? `return ${trimmed.slice(0, -1)};`
          : `return ${trimmed};`;
        const element = await this.browser.getDriver().executeScript(script);
        return this._clickElement(element);
      }
    );
  }

  /**
   * Clicks on an element located by evaluating a JavaScript expression and waits for the page complete check to finish.
   *
   * @async
   * @param {string} js - The JavaScript expression that evaluates to an element or list of elements.
   * @returns {Promise<void>} A promise that resolves when the click action and page complete check are finished.
   * @throws {Error} Throws an error if the element is not found.
   */
  async byJsAndWait(js) {
    return this._andWait(this.byJs, js);
  }

  /**
   * Clicks on an element located by its ID.
   *
   * @async
   * @param {string} id - The ID of the element to click.
   * @returns {Promise<void>} A promise that resolves when the click action is performed.
   * @throws {Error} Throws an error if the element is not found.
   */
  async byId(id) {
    return executeCommand(
      log,
      'Could not find element by id %s',
      id,
      async () => {
        const element = await this.browser.getDriver().findElement(By.id(id));
        return this._clickElement(element);
      }
    );
  }

  /**
   * Clicks on an element located by its name attribute.
   *
   * @async
   * @param {string} name - The name attribute of the element to click.
   * @returns {Promise<void>} A promise that resolves when the click action is performed.
   * @throws {Error} Throws an error if the element is not found.
   */
  async byName(name) {
    return executeCommand(
      log,
      'Could not find element by name %s',
      name,
      async () => {
        const element = await this.browser
          .getDriver()
          .findElement(By.name(name));
        return this._clickElement(element);
      }
    );
  }

  /**
   * Click on link located by the ID attribute. Uses document.getElementById() to find the element. And wait for page complete check to finish.
   * @param {string} id
   * @returns {Promise<void>} Promise object represents when the element has been clicked and the pageCompleteCheck has finished.
   * @throws Will throw an error if the element is not found
   */
  async byIdAndWait(id) {
    return this._andWait(this.byId, id);
  }

  /**
   * Clicks on an element located by its CSS selector.
   *
   * @async
   * @param {string} selector - The CSS selector of the element to click.
   * @returns {Promise<void>} A promise that resolves when the click action is performed.
   * @throws {Error} Throws an error if the element is not found.
   */
  async bySelector(selector) {
    return executeCommand(
      log,
      'Could not click using selector %s',
      selector,
      async () => {
        const element = await this.browser
          .getDriver()
          .findElement(By.css(selector));
        return this._clickElement(element);
      }
    );
  }

  /**
   * Clicks on an element located by its CSS selector and waits for the page complete check to finish.
   *
   * @async
   * @param {string} selector - The CSS selector of the element to click.
   * @returns {Promise<void>} A promise that resolves when the click action and page complete check are finished.
   * @throws {Error} Throws an error if the element is not found.
   */
  async bySelectorAndWait(selector) {
    return this._andWait(this.bySelector, selector);
  }
}
