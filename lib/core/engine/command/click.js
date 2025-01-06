import { getLogger } from '@sitespeed.io/log';
const log = getLogger('browsertime.command.click');

function addClick(js) {
  const trimmed = js.trim();
  let script = `${trimmed}.click();`;
  if (trimmed.endsWith(';')) {
    script = `${trimmed.slice(0, -1)}.click();`;
  }
  return script;
}

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
   * Clicks on an element identified by its class name.
   *
   * @async
   * @param {string} className - The class name of the element to click.
   * @returns {Promise<void>} A promise that resolves when the click action is performed.
   * @throws {Error} Throws an error if the element is not found.
   */
  async byClassName(className) {
    try {
      const script = `document.getElementsByClassName('${className}')[0].click();`;
      await this.browser.runScript(script, 'CUSTOM');
    } catch (error) {
      log.error('Could not find element by class name %s', className);
      log.verbose(error);
      throw new Error('Could not find element by class name ' + className);
    }
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
    try {
      const script = `document.getElementsByClassName('${className}')[0].click();`;
      await this.browser.runScript(script, 'CUSTOM');
      return this.browser.extraWait(this.pageCompleteCheck);
    } catch (error) {
      log.error('Could not find element by class name %s', className);
      log.verbose(error);
      throw new Error('Could not find element by class name ' + className);
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
   * Clicks on a link whose visible text matches the given string and waits for the page complete check to finish.
   *
   * @async
   * @param {string} text - The visible text of the link to click.
   * @returns {Promise<void>} A promise that resolves when the click action and page complete check are finished.
   * @throws {Error} Throws an error if the link is not found.
   */
  async byLinkTextAndWait(text) {
    try {
      const xpath = `//a[text()='${text}']`;
      return this.byXpathAndWait(xpath);
    } catch (error) {
      log.error('Could not find link with text %s', text);
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
   * Clicks on a link whose visible text contains the given substring and waits for the page complete check to finish.
   *
   * @async
   * @param {string} text - The substring of the visible text of the link to click.
   * @returns {Promise<void>} A promise that resolves when the click action and page complete check are finished.
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
   * Clicks on an element that matches a given XPath selector.
   *
   * @async
   * @param {string} xpath - The XPath selector of the element to click.
   * @returns {Promise<void>} A promise that resolves when the click action is performed.
   * @throws {Error} Throws an error if the element is not found.
   */
  async byXpath(xpath) {
    try {
      // This is how Selenium do internally
      const replaced = xpath.replaceAll('"', "'");
      const script = `document.evaluate("${replaced}", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click();`;
      return this.browser.runScript(script, 'CUSTOM');
    } catch (error) {
      log.error('Could not find element by xpath %s', xpath);
      log.verbose(error);
      throw new Error('Could not find element by xpath ' + xpath);
    }
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
    try {
      // This is how Selenium do internally
      const replaced = xpath.replaceAll('"', "'");
      const script = `document.evaluate("${replaced}", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click();`;
      await this.browser.runScript(script, 'CUSTOM');
      return this.browser.extraWait(this.pageCompleteCheck);
    } catch (error) {
      log.error('Could not find element by xpath %s', xpath);
      log.verbose(error);
      throw new Error('Could not find element by xpath ' + xpath);
    }
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
    try {
      const script = addClick(js);
      await this.browser.runScript(script, 'CUSTOM');
    } catch (error) {
      log.error('Could not find element by JavaScript %s', js);
      log.verbose(error);
      throw new Error('Could not find element by JavaScript ' + js);
    }
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
    try {
      const script = addClick(js);
      await this.browser.runScript(script, 'CUSTOM');
      return this.browser.extraWait(this.pageCompleteCheck);
    } catch (error) {
      log.error('Could not find element by JavaScript %s', js);
      log.verbose(error);
      throw new Error('Could not find element by JavaScript ' + js);
    }
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
    try {
      const script = `document.getElementById('${id}').click();`;
      await this.browser.runScript(script, 'CUSTOM');
    } catch (error) {
      log.error('Could not find element by id %s', id);
      log.verbose(error);
      throw new Error('Could not find element by id ' + id);
    }
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
    try {
      const script = `document.querySelector("[name='${name}']").click()`;
      await this.browser.runScript(script, 'CUSTOM');
    } catch (error) {
      log.error('Could not find element by name %s', name);
      log.verbose(error);
      throw new Error('Could not find element by name ' + name);
    }
  }

  /**
   * Click on link located by the ID attribute. Uses document.getElementById() to find the element. And wait for page complete check to finish.
   * @param {string} id
   * @returns {Promise<void>} Promise object represents when the element has been clicked and the pageCompleteCheck has finished.
   * @throws Will throw an error if the element is not found
   */
  async byIdAndWait(id) {
    try {
      const script = `document.getElementById('${id}').click();`;
      await this.browser.runScript(script, 'CUSTOM');
      return this.browser.extraWait(this.pageCompleteCheck);
    } catch (error) {
      log.error('Could not find element by id %s', id);
      log.verbose(error);
      throw new Error('Could not find element by id ' + id);
    }
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
    try {
      const script = `document.querySelector('${selector}').click();`;
      await this.browser.runScript(script, 'CUSTOM');
    } catch (error) {
      log.error('Could not click using selector %s', selector);
      log.verbose(error);
      throw new Error('Could not click using selector ' + selector);
    }
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
    try {
      const script = `document.querySelector('${selector}').click();`;
      await this.browser.runScript(script, 'CUSTOM');
      return this.browser.extraWait(this.pageCompleteCheck);
    } catch (error) {
      log.error('Could not click using selector %s', selector);
      log.verbose(error);
      throw new Error('Could not click using selector ' + selector);
    }
  }
}
