import { getLogger } from '@sitespeed.io/log';
import { By } from 'selenium-webdriver';
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
   * Performs a single mouse click on an element matching a given XPath selector.
   *
   * @async
   * @param {string} xpath - The XPath selector of the element to click.
   * @param {Object} [options] - Additional options for the click action.
   * @returns {Promise<void>} A promise that resolves when the single click action is performed.
   * @throws {Error} Throws an error if the element is not found.
   */
  async byXpath(xpath, options) {
    try {
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
    } catch (error) {
      log.error('Could not single click on element with xpath %s', xpath);
      log.verbose(error);
      throw new Error('Could not single click on element with xpath ' + xpath);
    }
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
    try {
      const element = await this.browser
        .getDriver()
        .findElement(By.xpath(xpath));
      await this.actions.click(element).perform();
      return this.browser.extraWait(this.pageCompleteCheck);
    } catch (error) {
      log.error('Could not single click on element with xpath %s', xpath);
      log.verbose(error);
      throw new Error('Could not single click on element with xpath ' + xpath);
    }
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
    try {
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
    } catch (error) {
      log.error('Could not single click on element with selector %s', selector);
      log.verbose(error);
      throw new Error(
        'Could not single click on element with selector ' + selector
      );
    }
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
    try {
      const element = await this.browser
        .getDriver()
        .findElement(By.css(selector));
      await this.actions.click(element).perform();
      return this.browser.extraWait(this.pageCompleteCheck);
    } catch (error) {
      log.error('Could not single click on element with selector %s', selector);
      log.verbose(error);
      throw new Error(
        'Could not single click on element with selector ' + selector
      );
    }
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
    try {
      await this.actions.click().perform();
      if (options && 'wait' in options && options.wait === true) {
        log.warn(
          'Please use the atCursorAndWait method instead.We want to deprecate and remove the options from this method so we follow the same pattern everywhere.'
        );
        return this.browser.extraWait(this.pageCompleteCheck);
      }
    } catch (error) {
      log.error('Could not perform single click');
      log.verbose(error);
      throw new Error('Could not perform single click');
    }
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
    try {
      await this.actions.click().perform();
      return this.browser.extraWait(this.pageCompleteCheck);
    } catch (error) {
      log.error('Could not perform single click');
      log.verbose(error);
      throw new Error('Could not perform single click');
    }
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
    try {
      const xpath = `//a[text()='${text}']`;
      return this.byXpath(xpath);
    } catch (error) {
      log.error('Could not find link by text %s', text);
      log.verbose(error);
      throw new Error('Could not find link by text ' + text);
    }
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
    try {
      const xpath = `//a[text()='${text}']`;
      return this.byXpathAndWait(xpath);
    } catch (error) {
      log.error('Could not find link by text %s', text);
      log.verbose(error);
      throw new Error('Could not find link by text ' + text);
    }
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
    try {
      const xpath = `//a[contains(text(),'${text}')]`;
      return this.byXpath(xpath);
    } catch (error) {
      log.error('Could not find link by partial text %s', text);
      log.verbose(error);
      throw new Error('Could not find link by partial text ' + text);
    }
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
    try {
      const xpath = `//a[contains(text(),'${text}')]`;
      return this.byXpathAndWait(xpath);
    } catch (error) {
      log.error('Could not find link by partial text %s', text);
      log.verbose(error);
      throw new Error('Could not find link by partial text ' + text);
    }
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
    try {
      const element = await this.browser.getDriver().findElement(By.id(id));
      return this.actions.click(element).perform();
    } catch (error) {
      log.error('Could not find the element with id %s', id);
      log.verbose(error);
      throw new Error('Could not the element with id ' + id);
    }
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
    try {
      const element = await this.browser.getDriver().findElement(By.id(id));
      await this.actions.click(element).perform();
      return this.browser.extraWait(this.pageCompleteCheck);
    } catch (error) {
      log.error('Could not find the element with id %s', id);
      log.verbose(error);
      throw new Error('Could not the element with id ' + id);
    }
  }
}
