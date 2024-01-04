import webdriver from 'selenium-webdriver';
import intel from 'intel';
const log = intel.getLogger('browsertime.command.wait');
const delay = ms => new Promise(res => setTimeout(res, ms));

/**
 * Provides functionality to wait for different conditions in the browser.
 *
 * @class
 */
export class Wait {
  constructor(browser, pageCompleteCheck) {
    /**
     * @private
     */
    this.browser = browser;
    /**
     * @private
     */
    this.pageCompleteCheck = pageCompleteCheck;
  }

  /**
   * Waits for an element with a specific ID to appear within a maximum time.
   *
   * @async
   * @param {string} id - The ID of the element to wait for.
   * @param {number} maxTime - Maximum time to wait in milliseconds.
   * @returns {Promise<void>} A promise that resolves when the element is found or the time times out.
   * @throws {Error} Throws an error if the element is not found within the specified time.
   */
  async byId(id, maxTime) {
    const driver = this.browser.getDriver();
    const time = maxTime || 6000;

    try {
      await driver.wait(
        webdriver.until.elementLocated(webdriver.By.id(id)),
        time
      );
    } catch (error) {
      log.error('Element by id %s was not located in %s ms', id, time);
      log.verbose(error);
      throw new Error(`Element by id ${id} was not located in ${time} ms`);
    }
  }

  /**
   * Waits for an element located by XPath to appear within a maximum time.
   *
   * @async
   * @param {string} xpath - The XPath of the element to wait for.
   * @param {number} maxTime - Maximum time to wait in milliseconds.
   * @returns {Promise<void>} A promise that resolves when the element is found or the time times out.
   * @throws {Error} Throws an error if the element is not found within the specified time.
   */
  async byXpath(xpath, maxTime) {
    const driver = this.browser.getDriver();
    const time = maxTime || 6000;

    try {
      await driver.wait(
        webdriver.until.elementLocated(webdriver.By.xpath(xpath)),
        time
      );
    } catch (error) {
      log.error('Element by xpath %s was not located in %s ms', xpath, time);
      log.verbose(error);
      throw new Error(
        `Element by xpath ${xpath} was not located in ${time} ms`
      );
    }
  }

  /**
   * Waits for an element located by a CSS selector to appear within a maximum time.
   *
   * @async
   * @param {string} selector - The CSS selector of the element to wait for.
   * @param {number} maxTime - Maximum time to wait in milliseconds.
   * @returns {Promise<void>} A promise that resolves when the element is found or the time times out.
   * @throws {Error} Throws an error if the element is not found within the specified time.
   */
  async bySelector(selector, maxTime) {
    const driver = this.browser.getDriver();
    const time = maxTime || 6000;

    try {
      await driver.wait(
        webdriver.until.elementLocated(webdriver.By.css(selector)),
        time
      );
    } catch (error) {
      log.error(
        'Element by selector %s was not located in %s ms',
        selector,
        time
      );
      log.verbose(error);
      throw new Error(
        `Element by selector ${selector} was not located in ${time} ms`
      );
    }
  }

  /**
   * Waits for a specified amount of time.
   *
   * @async
   * @param {number} ms - The time in milliseconds to wait.
   * @returns {Promise<void>} A promise that resolves when the specified time has elapsed.
   */
  async byTime(ms) {
    return delay(ms);
  }

  /**
   * Waits for the page to finish loading.
   *
   * @async
   * @returns {Promise<void>} A promise that resolves when the page complete check has finished.
   */
  async byPageToComplete() {
    return this.browser.extraWait(this.pageCompleteCheck);
  }

  /**
   * Waits for a JavaScript condition to return a truthy value within a maximum time.
   *
   * @async
   * @param {string} jsExpression - The JavaScript expression to evaluate.
   * @param {number} maxTime - Maximum time to wait in milliseconds.
   * @returns {Promise<void>} A promise that resolves when the condition becomes truthy or the time times out.
   * @throws {Error} Throws an error if the condition is not met within the specified time.
   */
  async byCondition(jsExpression, maxTime) {
    const driver = this.browser.getDriver();
    const time = maxTime || 6000;

    try {
      const script = `return ${jsExpression}`;
      await driver.wait(() => {
        return driver.executeScript(script);
      }, time);
    } catch (error) {
      log.error('Condition was not met', jsExpression, time);
      log.verbose(error);
      throw new Error(`Condition ${jsExpression} was not met in ${time} ms`);
    }
  }
}
