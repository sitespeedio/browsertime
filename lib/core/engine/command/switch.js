'use strict';

const log = require('intel').getLogger('browsertime.command.switch');

class Switch {
  constructor(browser) {
    this.browser = browser;
  }

  /**
   * Switch to frame by id
   * @param {*} id
   */
  async toFrame(id) {
    const driver = this.browser.getDriver();
    try {
      await driver.switchTo().frame(id);
    } catch (e) {
      log.error('Could not switch to frame with id %s ', id);
      log.verbose(e);
      throw e;
    }
  }

  /**
   * Swicth yo a window by name
   * @param {*} name
   */
  async toWindow(name) {
    const driver = this.browser.getDriver();
    try {
      await driver.switchTo().window(name);
    } catch (e) {
      log.error('Could not switch to frame with id %s ', name);
      log.verbose(e);
      throw e;
    }
  }

  /**
   * Switch to parent frame
   */
  async toParentFrame() {
    const driver = this.browser.getDriver();
    try {
      await driver.switchTo().parentFrame();
    } catch (e) {
      log.error('Could not switch to parent frame');
      log.verbose(e);
      throw e;
    }
  }
}
module.exports = Switch;
