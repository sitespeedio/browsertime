'use strict';

const log = require('intel').getLogger('browsertime.command.click');

function addClick(js) {
  const trimmed = js.trim();
  let script = `${trimmed}.click();`;
  if (trimmed.endsWith(';')) {
    script = `${trimmed.slice(0, -1)}.click();`;
  }
  return script;
}

class Click {
  constructor(browser, pageCompleteCheck) {
    this.browser = browser;
    this.pageCompleteCheck = pageCompleteCheck;
  }

  /**
   * Click on element that is found by specific class name.
   * https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementsByClassName
   * ;
   * @param {string} className
   * @returns {Promise} Promise object represents when the element has been clicked
   * @throws Will throw an error if the element is not found
   */
  async byClassName(className) {
    try {
      const script = `document.getElementsByClassName('${className}')[0].click();`;
      await this.browser.runScript(script, 'CUSTOM');
    } catch (e) {
      log.error('Could not find element by class name %s', className);
      log.verbose(e);
      throw Error('Could not find element by class name ' + className);
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
      const script = `document.getElementsByClassName('${className}')[0].click();`;
      await this.browser.runScript(script, 'CUSTOM');
      return this.browser.extraWait(this.pageCompleteCheck);
    } catch (e) {
      log.error('Could not find element by class name %s', className);
      log.verbose(e);
      throw Error('Could not find element by class name ' + className);
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
      const xpath = `//a[text()='${text}']`;
      return this.byXpath(xpath);
    } catch (e) {
      log.error('Could not find link by text %s', text);
      log.verbose(e);
      throw Error('Could not find link by text ' + text);
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
      const xpath = `//a[text()='${text}']`;
      return this.byXpathAndWait(xpath);
    } catch (e) {
      log.error('Could not find link with text %s', text);
      log.verbose(e);
      throw Error('Could not find link by text ' + text);
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
      const xpath = `//a[contains(text(),'${text}')]`;
      return this.byXpath(xpath);
    } catch (e) {
      log.error('Could not find link by partial text %s', text);
      log.verbose(e);
      throw Error('Could not find link by partial text ' + text);
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
      const xpath = `//a[contains(text(),'${text}')]`;
      return this.byXpathAndWait(xpath);
    } catch (e) {
      log.error('Could not find link by partial text %s', text);
      log.verbose(e);
      throw Error('Could not find link by partial text ' + text);
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
      // This is how Selenium do internally
      const replaced = xpath.replace(/"/g, "'");
      const script = `document.evaluate("${replaced}", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click();`;
      return this.browser.runScript(script, 'CUSTOM');
    } catch (e) {
      log.error('Could not find element by xpath %s', xpath);
      log.verbose(e);
      throw Error('Could not find element by xpath ' + xpath);
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
      // This is how Selenium do internally
      const replaced = xpath.replace(/"/g, "'");
      const script = `document.evaluate("${replaced}", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click();`;
      await this.browser.runScript(script, 'CUSTOM');
      return this.browser.extraWait(this.pageCompleteCheck);
    } catch (e) {
      log.error('Could not find element by xpath %s', xpath);
      log.verbose(e);
      throw Error('Could not find element by xpath ' + xpath);
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
      const script = addClick(js);
      await this.browser.runScript(script, 'CUSTOM');
    } catch (e) {
      log.error('Could not find element by JavaScript %s', js);
      log.verbose(e);
      throw Error('Could not find element by JavaScript ' + js);
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
      const script = addClick(js);
      await this.browser.runScript(script, 'CUSTOM');
      return this.browser.extraWait(this.pageCompleteCheck);
    } catch (e) {
      log.error('Could not find element by JavaScript %s', js);
      log.verbose(e);
      throw Error('Could not find element by JavaScript ' + js);
    }
  }

  /**
   * Click on link located by the ID attribute. Uses document.getElementById().
   * @param {string} id
   * @returns {Promise} Promise object represents when the element has been clicked
   * @throws Will throw an error if the element is not found
   */
  async byId(id) {
    try {
      const script = `document.getElementById('${id}').click();`;
      await this.browser.runScript(script, 'CUSTOM');
    } catch (e) {
      log.error('Could not find element by id %s', id);
      log.verbose(e);
      throw Error('Could not find element by id ' + id);
    }
  }

  /**
   * Click on element located by the name, Uses document.querySelector.
   * @param {string} name the name of the element
   * @returns {Promise} Promise object represents when the element has been clicked
   * @throws Will throw an error if the element is not found
   */
  async byName(name) {
    try {
      const script = `document.querySelector("[name='${name}']").click()`;
      await this.browser.runScript(script, 'CUSTOM');
    } catch (e) {
      log.error('Could not find element by name %s', name);
      log.verbose(e);
      throw Error('Could not find element by name ' + name);
    }
  }

  /**
   * Click on link located by the ID attribute. Uses document.getElementById() to find the element. And wait for page complete check to finish.
   * @param {string} id
   * @returns {Promise} Promise object represents when the element has been clicked and the pageCompleteCheck has finished.
   * @throws Will throw an error if the element is not found
   */
  async byIdAndWait(id) {
    try {
      const script = `document.getElementById('${id}').click();`;
      await this.browser.runScript(script, 'CUSTOM');
      return this.browser.extraWait(this.pageCompleteCheck);
    } catch (e) {
      log.error('Could not find element by id %s', id);
      log.verbose(e);
      throw Error('Could not find element by id ' + id);
    }
  }

  async bySelector(selector) {
    try {
      const script = `document.querySelector('${selector}').click();`;
      await this.browser.runScript(script, 'CUSTOM');
    } catch (e) {
      log.error('Could not click using selector %s', selector);
      log.verbose(e);
      throw Error('Could not click using selector ' + selector);
    }
  }

  async bySelectorAndWait(selector) {
    try {
      const script = `document.querySelector('${selector}').click();`;
      await this.browser.runScript(script, 'CUSTOM');
      return this.browser.extraWait(this.pageCompleteCheck);
    } catch (e) {
      log.error('Could not click using selector %s', selector);
      log.verbose(e);
      throw Error('Could not click using selector ' + selector);
    }
  }
}
module.exports = Click;
