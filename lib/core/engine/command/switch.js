import { getLogger } from '@sitespeed.io/log';
import { By } from 'selenium-webdriver';
const log = getLogger('browsertime.command.switch');

/**
 * Provides functionality to switch between frames, windows, and tabs in the browser.
 *
 * @class
 * @hideconstructor
 */
export class Switch {
  constructor(browser, pageCompleteCheck, navigate) {
    /**
     * @private
     */
    this.browser = browser;
    /**
     * @private
     */
    this.pageCompleteCheck = pageCompleteCheck;
    /**
     * @private
     */
    this.navigate = navigate;
  }

  /**
   * Switches to a frame identified by its ID.
   *
   * @async
   * @param {string|number} id - The ID of the frame.
   * @throws {Error} Throws an error if switching to the frame fails.
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
   * Switches to a frame identified by an XPath.
   *
   * @async
   * @param {string} xpath - The XPath of the frame element.
   * @throws {Error} Throws an error if the frame is not found or switching fails.
   */
  async toFrameByXpath(xpath) {
    const driver = this.browser.getDriver();
    try {
      const element = await driver.findElement(By.xpath(xpath));
      if (element) {
        await driver.switchTo().frame(element);
      } else {
        log.error('Could not find frame using xpath %s ', xpath);
        throw new Error(`Could not find frame using xpath ${xpath}`);
      }
    } catch (error) {
      log.error('Could not switch to frame using xpath %s ', xpath);
      log.verbose(error);
      throw new Error(`Could not switch to frame using xpath ${xpath}`);
    }
  }

  /**
   * Switches to a frame identified by a CSS selector.
   *
   * @async
   * @param {string} selector - The CSS selector of the frame element.
   * @throws {Error} Throws an error if the frame is not found or switching fails.
   */
  async toFrameBySelector(selector) {
    const driver = this.browser.getDriver();
    try {
      const element = await driver.findElement(By.css(selector));
      if (element) {
        await driver.switchTo().frame(element);
      } else {
        log.error('Could not find frame using selector%s ', selector);
        throw new Error(`Could not find frame using selector ${selector}`);
      }
    } catch (error) {
      log.error('Could not switch to frame using selector %s ', selector);
      log.verbose(error);
      throw new Error(`Could not switch to frame using selector${selector}`);
    }
  }

  /**
   * Switches to a window identified by its name.
   *
   * @async
   * @param {string} name - The name of the window.
   * @throws {Error} Throws an error if switching to the window fails.
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
   * Switches to the parent frame of the current frame.
   *
   * @async
   * @throws {Error} Throws an error if switching to the parent frame fails.
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
   * Opens a new tab and optionally navigates to a URL.
   *
   * @async
   * @param {string} [url] - Optional URL to navigate to in the new tab.
   * @throws {Error} Throws an error if opening a new tab fails.
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
   * Opens a new window and optionally navigates to a URL.
   *
   * @async
   * @param {string} [url] - Optional URL to navigate to in the new window.
   * @throws {Error} Throws an error if opening a new window fails.
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
