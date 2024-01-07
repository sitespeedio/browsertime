// We disable these because they are needed for code completion
/* eslint no-unused-vars: "off" */
import { By, WebElement } from 'selenium-webdriver';
/**
 * This class provides a way to get hokld of Seleniums WebElements.
 * @class
 * @hideconstructor
 */
export class Element {
  constructor(browser) {
    /**
     * @private
     */
    this.driver = browser.getDriver();
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
}
