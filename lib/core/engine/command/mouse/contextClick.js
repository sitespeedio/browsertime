import intel from 'intel';
import { By } from 'selenium-webdriver';
const log = intel.getLogger('browsertime.command.mouse');
export class ContextClick {
  constructor(browser) {
    this.driver = browser.getDriver();
    this.actions = this.driver.actions({ async: true });
  }

  /**
   * Perform ContextClick on an element that matches a XPath selector.
   * @param {string} xpath
   * @returns {Promise} Promise object represents when context click occurs.
   * @throws Will throw an error if the element is not found
   */
  async byXpath(xpath) {
    try {
      const element = await this.driver.findElement(By.xpath(xpath));
      return this.actions.contextClick(element).perform();
    } catch (error) {
      log.error('Could not context click on element with xpath %s', xpath);
      log.verbose(error);
      throw new Error('Could not context click on element with xpath ' + xpath);
    }
  }

  /**
   * Perform ContextClick on an element that matches a CSS selector.
   * @param {string} css selector
   * @returns {Promise} Promise object represents when context click occurs.
   * @throws Will throw an error if the element is not found
   */
  async bySelector(selector) {
    try {
      const element = await this.driver.findElement(By.css(selector));
      return this.actions.contextClick(element).perform();
    } catch (error) {
      log.error('Could not context click on element with css %s', selector);
      log.verbose(error);
      throw new Error(
        'Could not context click on element with css ' + selector
      );
    }
  }

  /**
   * Perform ContextClick at the cursor's position.
   * @returns {Promise} Promise object represents when context click occurs.
   * @throws Will throw an error if context click cannot be performed.
   */
  async atCursor() {
    try {
      return this.actions.contextClick().perform();
    } catch (error) {
      log.error('Could not perform context click');
      log.verbose(error);
      throw new Error('Could not perform context click');
    }
  }
}
