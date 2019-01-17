'use strict';
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
    return driver.switchTo().frame(id);
  }

  /**
   * Swicth yo a window by name
   * @param {*} name
   */
  async toWindow(name) {
    const driver = this.browser.getDriver();
    return driver.switchTo().window(name);
  }

  /**
   * Switch to parent frame
   */
  async toParentFrame() {
    const driver = this.browser.getDriver();
    return driver.switchTo().parentFrame();
  }
}
module.exports = Switch;
