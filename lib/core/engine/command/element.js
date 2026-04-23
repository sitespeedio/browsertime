// We disable these because they are needed for code completion
/* eslint no-unused-vars: "off" */
import webdriver, { By, WebElement } from 'selenium-webdriver';
/**
 * This class provides a way to get hokld of Seleniums WebElements.
 * @class
 * @hideconstructor
 */
export class Element {
  constructor(browser, options) {
    /**
     * @private
     */
    this.driver = browser.getDriver();
    /**
     * @private
     */
    this.options = options;
  }

  /**
   * Finds an element by its CSS selector.
   *
   * @param {string} name - The CSS selector of the element.
   * @returns {Promise<WebElement>} A promise that resolves to the WebElement found.
   */
  async getByCss(name) {
    return this.driver.findElement(By.css(name));
  }

  /**
   * Finds an element by its ID.
   *
   * @param {string} id - The ID of the element.
   * @returns {Promise<WebElement>} A promise that resolves to the WebElement found.
   */
  async getById(id) {
    return this.driver.findElement(By.id(id));
  }

  /**
   * Finds an element by its XPath.
   *
   * @param {string} xpath - The XPath query of the element.
   * @returns {Promise<WebElement>} A promise that resolves to the WebElement found.
   */
  async getByXpath(xpath) {
    return this.driver.findElement(By.xpath(xpath));
  }

  /**
   * Finds an element by its class name.
   *
   * @param {string} className - The class name of the element.
   * @returns {Promise<WebElement>} A promise that resolves to the WebElement found.
   */
  async getByClassName(className) {
    return this.driver.findElement(By.className(className));
  }

  /**
   * Finds an element by its name attribute.
   *
   * @param {string} name - The name attribute of the element.
   * @returns {Promise<WebElement>} A promise that resolves to the WebElement found.
   */
  async getByName(name) {
    return this.driver.findElement(By.name(name));
  }

  /**
   * Finds an element using a CSS selector, with optional waiting and visibility check.
   *
   * @param {string} selector - The CSS selector of the element.
   * @param {Object} [options] - Options for finding the element.
   * @param {number} [options.timeout] - Maximum time in milliseconds to wait for the element. Defaults to the configured --timeouts.elementWait value.
   * @param {boolean} [options.visible=false] - If true, waits for the element to be visible, not just present.
   * @returns {Promise<WebElement>} A promise that resolves to the WebElement found.
   * @throws {Error} Throws an error if the element is not found within the timeout.
   */
  async find(selector, options = {}) {
    const timeout = options.timeout ?? this.options?.timeouts?.elementWait ?? 0;
    const visible = options.visible ?? false;
    const locator = By.css(selector);

    if (timeout > 0) {
      const element = await this.driver.wait(
        webdriver.until.elementLocated(locator),
        timeout
      );
      if (visible) {
        await this.driver.wait(
          webdriver.until.elementIsVisible(element),
          timeout
        );
      }
      return element;
    }
    return this.driver.findElement(locator);
  }
}
