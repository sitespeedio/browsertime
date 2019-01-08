'use strict';

const webdriver = require('selenium-webdriver');
const log = require('intel').getLogger('browsertime.command.click');

class Click {
  constructor(browser, pageCompleteCheck) {
    this.browser = browser;
    this.pageCompleteCheck = pageCompleteCheck;
  }

  async byName(name) {
    try {
      const element = await this.browser
        .getDriver()
        .findElement(webdriver.By.name(name));
      return this._clickHelp(element);
    } catch (e) {
      log.error('Could not find element by name %s', name);
      log.verbose(e);
    }
  }

  async byNameAndWait(name) {
    try {
      const element = await this.browser
        .getDriver()
        .findElement(webdriver.By.name(name));
      return this._clickHelp(element, true);
    } catch (e) {
      log.error('Could not find element by name %s', name);
      log.verbose(e);
    }
  }

  async byClassName(className) {
    try {
      const element = await this.browser
        .getDriver()
        .findElement(webdriver.By.className(className));
      return this._clickHelp(element);
    } catch (e) {
      log.error('Could not find element by class name %s', className);
      log.verbose(e);
    }
  }

  async byClassNameAndWait(className) {
    try {
      const element = await this.browser
        .getDriver()
        .findElement(webdriver.By.className(className));
      return this._clickHelp(element, true);
    } catch (e) {
      log.error('Could not find element by class name %s', className);
      log.verbose(e);
    }
  }

  async byLinkText(text) {
    try {
      const element = await this.browser
        .getDriver()
        .findElement(webdriver.By.linkText(text));
      return this._clickHelp(element);
    } catch (e) {
      log.error('Could not find link by text %s', text);
      log.verbose(e);
    }
  }

  async byLinkTextAndWait(text) {
    try {
      const element = await this.browser
        .getDriver()
        .findElement(webdriver.By.linkText(text));
      return this._clickHelp(element, true);
    } catch (e) {
      log.error('Could not find link with text %s', text);
      log.verbose(e);
    }
  }

  async byPartialLinkText(text) {
    try {
      const element = await this.browser
        .getDriver()
        .findElement(webdriver.By.partialLinkText(text));
      return this._clickHelp(element);
    } catch (e) {
      log.error('Could not find link by partial text %s', text);
      log.verbose(e);
    }
  }

  async byPartialLinkTextAndWait(text) {
    try {
      const element = await this.browser
        .getDriver()
        .findElement(webdriver.By.partialLinkText(text));
      return this._clickHelp(element, true);
    } catch (e) {
      log.error('Could not find link by partial text %s', text);
      log.verbose(e);
    }
  }

  async byXpath(xpath) {
    try {
      const element = await this.browser
        .getDriver()
        .findElement(webdriver.By.xpath(xpath));
      return this._clickHelp(element);
    } catch (e) {
      log.error('Could not find element by xpath %s', xpath);
      log.verbose(e);
    }
  }
  async byXpathAndWait(xpath) {
    try {
      const element = await this.browser
        .getDriver()
        .findElement(webdriver.By.xpath(xpath));
      return this._clickHelp(element, true);
    } catch (e) {
      log.error('Could not find element by xpath %s', xpath);
      log.verbose(e);
    }
  }

  async byJs(js) {
    try {
      const element = await this.browser
        .getDriver()
        .findElement(webdriver.By.js(js));
      return this._clickHelp(element);
    } catch (e) {
      log.error('Could not find element by JavaScript %s', js);
      log.verbose(e);
    }
  }

  async byJsAndWait(js) {
    try {
      const element = await this.browser
        .getDriver()
        .findElement(webdriver.By.js(js));
      return this._clickHelp(element, true);
    } catch (e) {
      log.error('Could not find element by JavaScript %s', js);
      log.verbose(e);
    }
  }

  async byId(id) {
    try {
      const element = await this.browser
        .getDriver()
        .findElement(webdriver.By.id(id));
      return this._clickHelp(element);
    } catch (e) {
      log.error('Could not find element by id %s', id);
      log.verbose(e);
    }
  }

  async byIdAndWait(id) {
    try {
      const element = await this.browser
        .getDriver()
        .findElement(webdriver.By.id(id));
      return this._clickHelp(element, true);
    } catch (e) {
      log.error('Could not find element by id %s', id);
      log.verbose(e);
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
