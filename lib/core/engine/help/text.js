'use strict';

const webdriver = require('selenium-webdriver');
const log = require('intel').getLogger('browsertime.text');

class Text {
  constructor(browser) {
    this.browser = browser;
  }

  async byId(text, id) {
    const driver = this.browser.getDriver();
    try {
      const element = await driver.findElement(webdriver.By.id(id));
      return element.sendKeys(text);
    } catch (e) {
      log.error('Could not add text %s to id %s', text, id, e);
      throw e;
    }
  }
}
module.exports = Text;
