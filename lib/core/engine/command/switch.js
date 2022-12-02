import intel from 'intel';
const log = intel.getLogger('browsertime.command.switch');

export class Switch {
  constructor(browser, pageCompleteCheck, navigate) {
    this.browser = browser;
    this.pageCompleteCheck = pageCompleteCheck;
    this.navigate = navigate;
  }

  /**
   * Switch to frame by id
   * @param {*} id
   */
  async toFrame(id) {
    const driver = this.browser.getDriver();
    try {
      await driver.switchTo().frame(id);
    } catch (error) {
      log.error('Could not switch to frame with id %s ', id);
      log.verbose(error);
      throw new Error(`Could not switch to frame with id  ${id}`);
    }
  }

  /**
   * Switch to a window by name
   * @param {*} name
   */
  async toWindow(name) {
    const driver = this.browser.getDriver();
    try {
      await driver.switchTo().window(name);
    } catch (error) {
      log.error('Could not switch to frame with name %s ', name);
      log.verbose(error);
      throw new Error(`Could not switch to frame with name  ${name}`);
    }
  }

  /**
   * Switch to parent frame
   */
  async toParentFrame() {
    const driver = this.browser.getDriver();
    try {
      await driver.switchTo().parentFrame();
    } catch (error) {
      log.error('Could not switch to parent frame');
      log.verbose(error);
      throw new Error(`Could not switch to parent frame`);
    }
  }

  /**
   * Create a new tab and switch to it. Optionally, navigate to a given url.
   */
  async toNewTab(url) {
    try {
      await this.browser.getDriver().switchTo().newWindow('tab');
      if (url) {
        await this.navigate(url);
        await this.browser.extraWait(this.pageCompleteCheck);
      }
    } catch (error) {
      log.error('Could not open new tab');
      log.verbose(error);
      throw new Error('Could not open new tab');
    }

    return;
  }

  /**
   * Create a new window and switch to it. Optionally, navigate to a given url.
   */
  async toNewWindow(url) {
    try {
      await this.browser.getDriver().switchTo().newWindow('window');
      if (url) {
        await this.navigate(url);
        await this.browser.extraWait(this.pageCompleteCheck);
      }
    } catch (error) {
      log.error('Could not open new window');
      log.verbose(error);
      throw new Error('Could not open new window');
    }

    return;
  }
}
