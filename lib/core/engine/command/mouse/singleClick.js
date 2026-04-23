import { getLogger } from '@sitespeed.io/log';
import { By } from 'selenium-webdriver';
import { executeCommand } from '../commandHelper.js';
const log = getLogger('browsertime.command.mouse');

/**
 * Provides functionality to perform a single click action on elements or at specific positions in a web page. Uses Seleniums Action API.
 *
 * @hideconstructor
 * @class
 */
export class SingleClick {
  constructor(browser, pageCompleteCheck) {
    /**
     * @private
     */
    this.browser = browser;
    /**
     * @private
     */
    this.actions = this.browser.getDriver().actions({ async: true });
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
   * Performs a single mouse click on an element matching a given XPath selector.
   *
   * @async
   * @param {string} xpath - The XPath selector of the element to click.
   * @param {Object} [options] - Additional options for the click action.
   * @returns {Promise<void>} A promise that resolves when the single click action is performed.
   * @throws {Error} Throws an error if the element is not found.
   */
  async byXpath(xpath, options) {
    return executeCommand(
      log,
      'Could not single click on element with xpath %s',
      xpath,
      async () => {
        const element = await this.browser
          .getDriver()
          .findElement(By.xpath(xpath));
        await this.actions.click(element).perform();
        if (options && 'wait' in options && options.wait === true) {
          log.warn(
            'Please use the byXpathAndWait method instead. We want to deprecate and remove the options from this method so we follow the same pattern everywhere.'
          );
          return this.browser.extraWait(this.pageCompleteCheck);
        }
      },
      this.browser
    );
  }

  /**
   * Performs a single mouse click on an element matching a given XPath selector and wait for page complete check.
   *
   * @async
   * @param {string} xpath - The XPath selector of the element to click.
   * @returns {Promise<void>} A promise that resolves when the single click action is performed.
   * @throws {Error} Throws an error if the element is not found.
   */
  async byXpathAndWait(xpath) {
    return this._andWait(this.byXpath, xpath);
  }

  /**
   * Performs a single mouse click on an element matching a given CSS selector.
   *
   * @async
   * @param {string} selector - The CSS selector of the element to click.
   * @param {Object} [options] - Additional options for the click action.
   * @returns {Promise<void>} A promise that resolves when the single click action is performed.
   * @throws {Error} Throws an error if the element is not found.
   */
  async bySelector(selector, options) {
    return executeCommand(
      log,
      'Could not single click on element with selector %s',
      selector,
      async () => {
        const element = await this.browser
          .getDriver()
          .findElement(By.css(selector));
        await this.actions.click(element).perform();
        if (options && 'wait' in options && options.wait === true) {
          log.warn(
            'Please use the bySelectorAndWait method instead. We want to deprecate and remove the options from this method so we follow the same pattern everywhere.'
          );
          return this.browser.extraWait(this.pageCompleteCheck);
        }
      },
      this.browser
    );
  }

  /**
   * Performs a single mouse click on an element matching a given CSS selector and waits on the page complete check.
   *
   * @async
   * @param {string} selector - The CSS selector of the element to click.
   * @returns {Promise<void>} A promise that resolves when the single click action is performed.
   * @throws {Error} Throws an error if the element is not found.
   */
  async bySelectorAndWait(selector) {
    return this._andWait(this.bySelector, selector);
  }

  /**
   * Performs a single mouse click at the current cursor position.
   *
   * @async
   * @param {Object} [options] - Additional options for the click action.
   * @returns {Promise<void>} A promise that resolves when the single click occurs.
   * @throws {Error} Throws an error if the single click action cannot be performed.
   */
  async atCursor(options) {
    return executeCommand(
      log,
      'Could not perform single click',
      undefined,
      async () => {
        await this.actions.click().perform();
        if (options && 'wait' in options && options.wait === true) {
          log.warn(
            'Please use the atCursorAndWait method instead.We want to deprecate and remove the options from this method so we follow the same pattern everywhere.'
          );
          return this.browser.extraWait(this.pageCompleteCheck);
        }
      },
      this.browser
    );
  }

  /**
   * Performs a single mouse click at the current cursor position and waits on the
   * page complete check.
   *
   * @async
   * @returns {Promise<void>} A promise that resolves when the single click occurs.
   * @throws {Error} Throws an error if the single click action cannot be performed.
   */
  async atCursorAndWait() {
    return this._andWait(this.atCursor);
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
    return executeCommand(
      log,
      'Could not find link by text %s',
      text,
      () => this.byXpath(`//a[text()='${text}']`),
      this.browser
    );
  }

  /**
   * Clicks on a link whose visible text matches the given string and waits on the opage complete check.
   *
   * @async
   * @param {string} text - The visible text of the link to click.
   * @returns {Promise<void>} A promise that resolves when the click action is performed.
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
   * Clicks on a link whose visible text contains the given substring and waits on the
   * page complete check.
   *
   * @async
   * @param {string} text - The substring of the visible text of the link to click.
   * @returns {Promise<void>} A promise that resolves when the click action is performed.
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
   * Clicks on a element with a specific id.
   *
   * @async
   * @param {string} id - The id of the link to click.
   * @returns {Promise<void>} A promise that resolves when the click action is performed.
   * @throws {Error} Throws an error if the id is not found.
   */
  async byId(id) {
    return executeCommand(
      log,
      'Could not find the element with id %s',
      id,
      async () => {
        const element = await this.browser.getDriver().findElement(By.id(id));
        return this.actions.click(element).perform();
      },
      this.browser
    );
  }

  /**
   * Clicks on a element with a specific id and wait on the page complete check
   *
   * @async
   * @param {string} id - The id of the link to click.
   * @returns {Promise<void>} A promise that resolves when the page has completed.
   * @throws {Error} Throws an error if the id is not found.
   */
  async byIdAndWait(id) {
    return this._andWait(this.byId, id);
  }
}
