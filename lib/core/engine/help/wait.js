'use strict';

const webdriver = require('selenium-webdriver');
const delay = ms => new Promise(res => setTimeout(res, ms));

class Wait {
  constructor(browser) {
    this.browser = browser;
  }

  async byId(id, maxTime) {
    const driver = this.browser.getDriver();
    const time = maxTime || 6000;

    return driver.wait(
      webdriver.until.elementLocated(webdriver.By.id(id)),
      time
    );
  }

  async byTime(ms) {
    return delay(ms);
  }
}
module.exports = Wait;
