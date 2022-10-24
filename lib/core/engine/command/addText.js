import { By } from 'selenium-webdriver';
import intel from 'intel';
const log = intel.getLogger('browsertime.command.addText');

class AddText {
  constructor(browser) {
    this.browser = browser;
  }

  /**
   * Add text to an element with Selenium sendKeys.
   * @param {string} text The text string that you want to add
   * @param {string} id The id of the element
   * @returns {Promise} Promise object represents when the text has been
   * added to the field
   * @throws Will throw an error if the element is not found
   */
  async byId(text, id) {
    const driver = this.browser.getDriver();
    try {
      const element = await driver.findElement(By.id(id));
      // make sure we clear it
      await element.clear();
      return element.sendKeys(text);
    } catch (error) {
      log.error('Could not add text %s to id %s', text, id);
      log.verbose(error);
      throw new Error(`Could not add text ${text} to id ${id}`);
    }
  }

  /**
   * Add text to an element with Selenium sendKeys.
   * @param {string} text The text string that you want to add
   * @param {string} xpath The xpath to the element
   * @returns {Promise} Promise object represents when the text has been
   * added to the field
   * @throws Will throw an error if the element is not found
   */
  async byXpath(text, xpath) {
    const driver = this.browser.getDriver();
    try {
      const element = await driver.findElement(By.xpath(xpath));
      // make sure we clear it
      await element.clear();
      return element.sendKeys(text);
    } catch (error) {
      log.error('Could not add text %s to xpath %s', text, xpath);
      log.verbose(error);
      throw new Error(`Could not add text ${text} to xpath ${xpath}`);
    }
  }

  /**
   * Add text to an element with Selenium sendKeys.
   * @param {string} text The text string that you want to add
   * @param {string} selector The CSS selector to the element
   * @returns {Promise} Promise object represents when the text has been
   * added to the field
   * @throws Will throw an error if the element is not found
   */
  async bySelector(text, selector) {
    const driver = this.browser.getDriver();
    try {
      const element = await driver.findElement(By.css(selector));
      // make sure we clear it
      await element.clear();
      return element.sendKeys(text);
    } catch (error) {
      log.error('Could not add text %s to selector %s', text, selector);
      log.verbose(error);
      throw new Error(`Could not add text ${text} to selector ${selector}`);
    }
  }

  /**
   * Add text to an element with Selenium sendKeys.
   * @param {string} text The text string that you want to add
   * @param {string} className A specific class name
   * @returns {Promise} Promise object represents when the text has been
   * added to the field
   * @throws Will throw an error if the element is not found
   */
  async byClassName(text, className) {
    const driver = this.browser.getDriver();
    try {
      const element = await driver.findElement(By.className(className));
      // make sure we clear it
      await element.clear();
      return element.sendKeys(text);
    } catch (error) {
      log.error('Could not add text %s to class name %s', text, className);
      log.verbose(error);
      throw new Error(`Could not add text ${text} to class name ${className}`);
    }
  }

  /**
   * Add text to an element with Selenium sendKeys.
   * @param {string} text The text string that you want to add
   * @param {string} name Element whose name attribute has the given value.
   * @returns {Promise} Promise object represents when the text has been
   * added to the field
   * @throws Will throw an error if the element is not found
   */
  async byName(text, name) {
    const driver = this.browser.getDriver();
    try {
      const element = await driver.findElement(By.name(name));
      // make sure we clear it
      await element.clear();
      return element.sendKeys(text);
    } catch (error) {
      log.error('Could not add text %s to name attribute  %s', text, name);
      log.verbose(error);
      throw new Error(`Could not add text ${text} to name attribute ${name}`);
    }
  }
}
export default AddText;
