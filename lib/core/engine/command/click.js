import { getLogger } from '@sitespeed.io/log';
import webdriver, { By } from 'selenium-webdriver';
import { executeCommand } from './commandHelper.js';
import { parseSelector } from './selectorParser.js';
const log = getLogger('browsertime.command.click');

/**
 * Provides functionality to perform click actions on elements in a web page using various selectors.
 * Uses the Selenium Actions API to generate real OS-level mouse events, which means
 * the element must be visible and interactable. If you need to click a hidden element,
 * use {@link JavaScript#run commands.js.run} to trigger a JavaScript click instead.
 *
 * @class
 * @hideconstructor
 */
export class Click {
  constructor(browser, pageCompleteCheck, options) {
    /**
     * @private
     */
    this.browser = browser;
    /**
     * @private
     */
    this.pageCompleteCheck = pageCompleteCheck;
    /**
     * @private
     */
    this.options = options;
  }

  /**
   * @private
   */
  async _waitForElement(driver, locator) {
    const timeout = this.options?.timeouts?.elementWait ?? 0;
    if (timeout > 0) {
      await driver.wait(webdriver.until.elementLocated(locator), timeout);
    }
  }

  /**
   * @private
   */
  async _andWait(baseMethod, ...args) {
    log.info(
      'The AndWait methods are deprecated. Use commands.click(selector, { wait: true }) instead.'
    );
    await baseMethod.apply(this, args);
    return this.browser.extraWait(this.pageCompleteCheck);
  }

  /**
   * @private
   */
  async _clickElement(element) {
    const driver = this.browser.getDriver();
    await driver.actions({ async: true }).click(element).perform();
    return driver.actions().clear();
  }

  /**
   * Clicks on an element using a unified selector string.
   * Supports CSS selectors (default), and prefix-based strategies:
   * 'id:myId', 'xpath://button', 'text:Submit', 'link:Click here', 'name:email', 'class:btn'.
   *
   * @async
   * @param {string} selector - The selector string. CSS by default, or use a prefix like 'id:', 'xpath:', 'text:', 'link:', 'name:', 'class:'.
   * @param {Object} [options] - Options for the click action.
   * @param {boolean} [options.waitForNavigation=false] - If true, waits for the page complete check after clicking.
   * @returns {Promise<void>} A promise that resolves when the click action is performed.
   * @throws {Error} Throws an error if the element is not found.
   */
  async run(selector, options = {}) {
    const { locator, description } = parseSelector(selector);
    return executeCommand(
      log,
      'Could not find element by %s',
      description,
      async () => {
        const driver = this.browser.getDriver();
        await this._waitForElement(driver, locator);
        const element = await driver.findElement(locator);
        await this._clickElement(element);
        if (options.waitForNavigation) {
          await this.browser.extraWait(this.pageCompleteCheck);
        }
      },
      this.browser
    );
  }

  /**
   * Clicks on an element identified by its class name.
   *
   * @async
   * @private
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
        const driver = this.browser.getDriver();
        const locator = By.className(className);
        await this._waitForElement(driver, locator);
        const element = await driver.findElement(locator);
        return this._clickElement(element);
      },
      this.browser
    );
  }

  /**
   * Clicks on an element identified by its class name and waits for the page complete check to finish.
   *
   * @async
   * @private
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
   * @private
   * @param {string} text - The visible text of the link to click.
   * @returns {Promise<void>} A promise that resolves when the click action is performed.
   * @throws {Error} Throws an error if the link is not found.
   */
  async byLinkText(text) {
    return executeCommand(
      log,
      'Could not find link by text %s',
      text,
      () => this.byXpath(`//a[text()='${text}']`),
      this.browser
    );
  }

  /**
   * Clicks on a link whose visible text matches the given string and waits for the page complete check to finish.
   *
   * @async
   * @private
   * @param {string} text - The visible text of the link to click.
   * @returns {Promise<void>} A promise that resolves when the click action and page complete check are finished.
   * @throws {Error} Throws an error if the link is not found.
   */
  async byLinkTextAndWait(text) {
    return executeCommand(
      log,
      'Could not find link by text %s',
      text,
      () => this.byXpathAndWait(`//a[text()='${text}']`),
      this.browser
    );
  }

  /**
   * Clicks on a link whose visible text contains the given substring.
   *
   * @async
   * @private
   * @param {string} text - The substring of the visible text of the link to click.
   * @returns {Promise<void>} A promise that resolves when the click action is performed.
   * @throws {Error} Throws an error if the link is not found.
   */
  async byPartialLinkText(text) {
    return executeCommand(
      log,
      'Could not find link by partial text %s',
      text,
      () => this.byXpath(`//a[contains(text(),'${text}')]`),
      this.browser
    );
  }

  /**
   * Clicks on a link whose visible text contains the given substring and waits for the page complete check to finish.
   *
   * @async
   * @private
   * @param {string} text - The substring of the visible text of the link to click.
   * @returns {Promise<void>} A promise that resolves when the click action and page complete check are finished.
   * @throws {Error} Throws an error if the link is not found.
   */
  async byPartialLinkTextAndWait(text) {
    return executeCommand(
      log,
      'Could not find link by partial text %s',
      text,
      () => this.byXpathAndWait(`//a[contains(text(),'${text}')]`),
      this.browser
    );
  }

  /**
   * Clicks on an element whose visible text matches the given string.
   * This works on any element type, not just links.
   *
   * @async
   * @private
   * @param {string} text - The visible text of the element to click.
   * @returns {Promise<void>} A promise that resolves when the click action is performed.
   * @throws {Error} Throws an error if the element is not found.
   */
  async byText(text) {
    return executeCommand(log, 'Could not find element by text %s', text, () =>
      this.byXpath(`//*[normalize-space(text())='${text}']`)
    );
  }

  /**
   * Clicks on an element whose visible text matches the given string and waits for the page complete check to finish.
   * This works on any element type, not just links.
   *
   * @async
   * @private
   * @param {string} text - The visible text of the element to click.
   * @returns {Promise<void>} A promise that resolves when the click action and page complete check are finished.
   * @throws {Error} Throws an error if the element is not found.
   */
  async byTextAndWait(text) {
    return executeCommand(log, 'Could not find element by text %s', text, () =>
      this.byXpathAndWait(`//*[normalize-space(text())='${text}']`)
    );
  }

  /**
   * Clicks on an element that matches a given XPath selector.
   *
   * @async
   * @private
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
        const driver = this.browser.getDriver();
        const locator = By.xpath(xpath);
        await this._waitForElement(driver, locator);
        const element = await driver.findElement(locator);
        return this._clickElement(element);
      },
      this.browser
    );
  }
  /**
   * Clicks on an element that matches a given XPath selector and waits for the page complete check to finish.
   *
   * @async
   * @private
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
   * @private
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
      },
      this.browser
    );
  }

  /**
   * Clicks on an element located by evaluating a JavaScript expression and waits for the page complete check to finish.
   *
   * @async
   * @private
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
   * @private
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
        const driver = this.browser.getDriver();
        const locator = By.id(id);
        await this._waitForElement(driver, locator);
        const element = await driver.findElement(locator);
        return this._clickElement(element);
      },
      this.browser
    );
  }

  /**
   * Clicks on an element located by its name attribute.
   *
   * @async
   * @private
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
        const driver = this.browser.getDriver();
        const locator = By.name(name);
        await this._waitForElement(driver, locator);
        const element = await driver.findElement(locator);
        return this._clickElement(element);
      },
      this.browser
    );
  }

  /**
   * Click on link located by the ID attribute. Uses document.getElementById() to find the element. And wait for page complete check to finish.
   * @private
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
   * @private
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
        const driver = this.browser.getDriver();
        const locator = By.css(selector);
        await this._waitForElement(driver, locator);
        const element = await driver.findElement(locator);
        return this._clickElement(element);
      },
      this.browser
    );
  }

  /**
   * Clicks on an element located by its CSS selector and waits for the page complete check to finish.
   *
   * @async
   * @private
   * @param {string} selector - The CSS selector of the element to click.
   * @returns {Promise<void>} A promise that resolves when the click action and page complete check are finished.
   * @throws {Error} Throws an error if the element is not found.
   */
  async bySelectorAndWait(selector) {
    return this._andWait(this.bySelector, selector);
  }
}
