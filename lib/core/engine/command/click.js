'use strict';

const webdriver = require('selenium-webdriver');
const log = require('intel').getLogger('browsertime.click');

class Click {
  constructor(browser, pageCompleteCheck) {
    this.browser = browser;
    this.pageCompleteCheck = pageCompleteCheck;
  }

  async byName(name) {
    const element = this.browser
      .getDriver()
      .findElement(webdriver.By.name(name));
    return this._clickHelp(element);
  }

  async byNameAndWait(name) {
    const element = this.browser
      .getDriver()
      .findElement(webdriver.By.name(name));
    return this._clickHelp(element, true);
  }

  async byClassName(className) {
    const element = this.browser
      .getDriver()
      .findElement(webdriver.By.className(className));
    return this._clickHelp(element);
  }

  async byClassNameAndWait(className) {
    const element = this.browser
      .getDriver()
      .findElement(webdriver.By.className(className));
    return this._clickHelp(element, true);
  }

  async byLinkText(text) {
    const element = this.browser
      .getDriver()
      .findElement(webdriver.By.linkText(text));
    return this._clickHelp(element);
  }

  async byLinkTextAndWait(text) {
    const element = this.browser
      .getDriver()
      .findElement(webdriver.By.linkText(text));
    return this._clickHelp(element, true);
  }

  async byPartialLinkText(text) {
    const element = this.browser
      .getDriver()
      .findElement(webdriver.By.partialLinkText(text));
    return this._clickHelp(element);
  }

  async byPartialLinkTextAndWait(text) {
    const element = this.browser
      .getDriver()
      .findElement(webdriver.By.partialLinkText(text));
    return this._clickHelp(element, true);
  }

  async byXpath(xpath) {
    const element = this.browser
      .getDriver()
      .findElement(webdriver.By.xpath(xpath));
    return this._clickHelp(element);
  }
  async byXpathAndWait(xpath) {
    const element = this.browser
      .getDriver()
      .findElement(webdriver.By.xpath(xpath));
    return this._clickHelp(element, true);
  }

  async byJs(js) {
    const element = await this.browser
      .getDriver()
      .findElement(webdriver.By.js(js));
    return this._clickHelp(element);
  }

  async byJsAndWait(js) {
    const element = await this.browser
      .getDriver()
      .findElement(webdriver.By.js(js));
    return this._clickHelp(element, true);
  }

  async byId(id) {
    const element = this.browser.getDriver().findElement(webdriver.By.id(id));
    return this._clickHelp(element);
  }

  async byIdAndWait(id) {
    const element = this.browser.getDriver().findElement(webdriver.By.id(id));
    return this._clickHelp(element, true);
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
