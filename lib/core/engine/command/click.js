'use strict';

const webdriver = require('selenium-webdriver');
const log = require('intel').getLogger('browsertime.command.click');

class Click {
  constructor(browser, pageCompleteCheck) {
    this.browser = browser;
    this.pageCompleteCheck = pageCompleteCheck;
  }

  /**
   * Click on element that is found by name attribute that has the given value.
   * @param {string} name
   * @returns {Promise} Promise object represents when the element has been clicked
   * @throws Will throw an error if the element is not found
   */
  async byName(name) {
    try {
      const element = await this.browser
        .getDriver()
        .findElement(webdriver.By.name(name));
      return this._clickHelp(element);
    } catch (e) {
      log.error('Could not find element by name %s', name);
      log.verbose(e);
      throw e;
    }
  }

  /**
   * Click on element that is found by name attribute that has the given value and wait for the normal
   * pageLoacCompoleteCheck to happen.
   * @param {string} name
   * @returns {Promise} Promise object represents when the element has been clicked and the pageCompleteCheck has finished.
   * @throws Will throw an error if the element is not found
   */
  async byNameAndWait(name) {
    try {
      const element = await this.browser
        .getDriver()
        .findElement(webdriver.By.name(name));
      return this._clickHelp(element, true);
    } catch (e) {
      log.error('Could not find element by name %s', name);
      log.verbose(e);
      throw e;
    }
  }

  /**
   * Click on element that is found by specific class name.
   *
   * @param {string} className
   * @returns {Promise} Promise object represents when the element has been clicked
   * @throws Will throw an error if the element is not found
   */
  async byClassName(className) {
    try {
      const element = await this.browser
        .getDriver()
        .findElement(webdriver.By.className(className));
      return this._clickHelp(element);
    } catch (e) {
      log.error('Could not find element by class name %s', className);
      log.verbose(e);
      throw e;
    }
  }

  /**
   * Click on element that is found by specific class name and wait for page load complete check to finish.
   * @param {string} className
   * @returns {Promise} Promise object represents when the element has been clicked and the pageCompleteCheck has finisshed.
   * @throws Will throw an error if the element is not found
   */
  async byClassNameAndWait(className) {
    try {
      const element = await this.browser
        .getDriver()
        .findElement(webdriver.By.className(className));
      return this._clickHelp(element, true);
    } catch (e) {
      log.error('Could not find element by class name %s', className);
      log.verbose(e);
      throw e;
    }
  }

  /**
   * Click on link whose visible text matches the given string.
   * @param {string} text
   * @returns {Promise} Promise object represents when the element has been clicked
   * @throws Will throw an error if the element is not found
   */
  async byLinkText(text) {
    try {
      const element = await this.browser
        .getDriver()
        .findElement(webdriver.By.linkText(text));
      return this._clickHelp(element);
    } catch (e) {
      log.error('Could not find link by text %s', text);
      log.verbose(e);
      throw e;
    }
  }

  /**
   * Click on link whose visible text matches the given string and wait for pageCompleteCheck to finish.
   * @param {string} text
   * @returns {Promise} Promise object represents when the element has been clicked and the pageCompleteCheck has finished.
   * @throws Will throw an error if the element is not found
   */
  async byLinkTextAndWait(text) {
    try {
      const element = await this.browser
        .getDriver()
        .findElement(webdriver.By.linkText(text));
      return this._clickHelp(element, true);
    } catch (e) {
      log.error('Could not find link with text %s', text);
      log.verbose(e);
      throw e;
    }
  }

  /**
   * Click on link whose visible text contains the given substring.
   * @param {string} text
   * @returns {Promise} Promise object represents when the element has been clicked
   * @throws Will throw an error if the element is not found
   */
  async byPartialLinkText(text) {
    try {
      const element = await this.browser
        .getDriver()
        .findElement(webdriver.By.partialLinkText(text));
      return this._clickHelp(element);
    } catch (e) {
      log.error('Could not find link by partial text %s', text);
      log.verbose(e);
      throw e;
    }
  }

  /**
   * Click on link whose visible text contains the given substring and wait for pageCompleteCheck to finish.
   * @param {string} text
   * @returns {Promise} Promise object represents when the element has been clicked and the pageCompleteCheck has finished.
   * @throws Will throw an error if the element is not found
   */
  async byPartialLinkTextAndWait(text) {
    try {
      const element = await this.browser
        .getDriver()
        .findElement(webdriver.By.partialLinkText(text));
      return this._clickHelp(element, true);
    } catch (e) {
      log.error('Could not find link by partial text %s', text);
      log.verbose(e);
      throw e;
    }
  }
  /**
   * Click on link that matches a XPath selector.
   * @param {string} xpath
   * @returns {Promise} Promise object represents when the element has been clicked
   * @throws Will throw an error if the element is not found
   */
  async byXpath(xpath) {
    try {
      const element = await this.browser
        .getDriver()
        .findElement(webdriver.By.xpath(xpath));
      return this._clickHelp(element);
    } catch (e) {
      log.error('Could not find element by xpath %s', xpath);
      log.verbose(e);
      throw e;
    }
  }
  /**.
   * Click on link that matches a XPath selector and wait for page load complete check to finish
   *
   * @param {string} xpath
   * @returns {Promise} Promise object represents when the element has been clicked and the pageCompleteCheck has finished.
   * @throws Will throw an error if the element is not found
   */
  async byXpathAndWait(xpath) {
    try {
      const element = await this.browser
        .getDriver()
        .findElement(webdriver.By.xpath(xpath));
      return this._clickHelp(element, true);
    } catch (e) {
      log.error('Could not find element by xpath %s', xpath);
      log.verbose(e);
      throw e;
    }
  }

  /**
   * Click on a link located by evaluating a JavaScript expression. The result of this expression must be an element or list of elements.
   *  @param {string} js
   * @returns {Promise} Promise object represents when the element has been clicked
   * @throws Will throw an error if the element is not found
   */
  async byJs(js) {
    try {
      const element = await this.browser
        .getDriver()
        .findElement(webdriver.By.js(js));
      return this._clickHelp(element);
    } catch (e) {
      log.error('Could not find element by JavaScript %s', js);
      log.verbose(e);
      throw e;
    }
  }

  /**
   * Click on a link located by evaluating a JavaScript expression. The result of this expression must be an element or list of elements. And wait for page complete check to finish.
   *  @param {string} js
   * @returns {Promise} Promise object represents when the element has been clicked and the pageCompleteCheck has finished.
   * @throws Will throw an error if the element is not found
   */
  async byJsAndWait(js) {
    try {
      const element = await this.browser
        .getDriver()
        .findElement(webdriver.By.js(js));
      return this._clickHelp(element, true);
    } catch (e) {
      log.error('Could not find element by JavaScript %s', js);
      log.verbose(e);
      throw e;
    }
  }

  /**
   * Click on link located by the ID attribute. This locator uses the CSS selector *[id="$ID"], not document.getElementById.
   * @param {string} id
   * @returns {Promise} Promise object represents when the element has been clicked
   * @throws Will throw an error if the element is not found
   */
  async byId(id) {
    try {
      const element = await this.browser
        .getDriver()
        .findElement(webdriver.By.id(id));
      return this._clickHelp(element);
    } catch (e) {
      log.error('Could not find element by id %s', id);
      log.verbose(e);
      throw e;
    }
  }

  /**
   * Click on link located by the ID attribute. This locator uses the CSS selector *[id="$ID"], not document.getElementById. And wait for page complete check to finish.
   * @param {string} id
   * @returns {Promise} Promise object represents when the element has been clicked and the pageCompleteCheck has finished.
   * @throws Will throw an error if the element is not found
   */
  async byIdAndWait(id) {
    try {
      const element = await this.browser
        .getDriver()
        .findElement(webdriver.By.id(id));
      return this._clickHelp(element, true);
    } catch (e) {
      log.error('Could not find element by id %s', id);
      log.verbose(e);
      throw e;
    }
  }

  async _clickHelp(element, wait) {
    if (element) {
      const linkPromise = element.click();
      if (wait) {
        await linkPromise;
        return this.browser.wait(this.pageCompleteCheck);
      } else {
        return linkPromise;
      }
    } else {
      log.error('Could not find %s on the page', element);
    }
  }
}
module.exports = Click;
