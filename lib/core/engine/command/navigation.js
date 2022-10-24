import intel from 'intel';
const log = intel.getLogger('browsertime.command.navigation');

export default class Navigation {
  constructor(browser, pageCompleteCheck) {
    this.browser = browser;
    this.pageCompleteCheck = pageCompleteCheck;
  }

  /**
   * Navigate backward in history
   */
  async back(options) {
    const driver = this.browser.getDriver();
    try {
      await driver.navigate().back();
      if (options && 'wait' in options && options.wait == true) {
        return this.browser.extraWait(this.pageCompleteCheck);
      }
    } catch (error) {
      log.error('Could not navigate back');
      log.verbose(error);
      throw new Error(`Could not navigate back`);
    }
  }

  /**
   * Navigate forward in history
   */
  async forward(options) {
    const driver = this.browser.getDriver();
    try {
      await driver.navigate().forward();
      if (options && 'wait' in options && options.wait === true) {
        return this.browser.extraWait(this.pageCompleteCheck);
      }
    } catch (error) {
      log.error('Could not navigate forward');
      log.verbose(error);
      throw new Error(`Could not navigate forward`);
    }
  }

  /**
   * Refresh page
   */
  async refresh(options) {
    const driver = this.browser.getDriver();
    try {
      await driver.navigate().refresh();
      if (options && 'wait' in options && options.wait === true) {
        return this.browser.extraWait(this.pageCompleteCheck);
      }
    } catch (error) {
      log.error('Could not refresh page');
      log.verbose(error);
      throw new Error(`Could not refresh page`);
    }
  }
}
