'use strict';

const webdriver = require('selenium-webdriver');
const log = require('intel').getLogger('browsertime.command.wait');
const delay = ms => new Promise(res => setTimeout(res, ms));

class Wait {
  constructor(browser) {
    this.browser = browser;
  }

  async byId(id, maxTime) {
    const driver = this.browser.getDriver();
    const time = maxTime || 6000;

    try {
      await driver.wait(
        webdriver.until.elementLocated(webdriver.By.id(id)),
        time
      );
    } catch (e) {
      log.error('Element by id %s was not located in %s ms', id, time);
      log.verbose(e);
    }
  }

  async byTime(ms) {
    return delay(ms);
  }
}
module.exports = Wait;
