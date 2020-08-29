'use strict';

class Screenshot {
  constructor(screenshotManager, browser, index) {
    this.screenshotManager = screenshotManager;
    this.browser = browser;
    this.index = index;
  }

  async take(name) {
    const url = await this.browser
      .getDriver()
      .executeScript('return document.documentURI;');
    const screenshot = await this.browser.takeScreenshot();
    return this.screenshotManager.save(name, screenshot, url, this.index);
  }
}
module.exports = Screenshot;
