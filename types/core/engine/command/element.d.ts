/**
 * This class provides a way to get hokld of Seleniums WebElements.
 * @class
 * @hideconstructor
 */
export class Element {
    constructor(browser: any);
    /**
     * @private
     */
    private driver;
    /**
     * Finds an element by its CSS selector.
     *
     * @param {string} name - The CSS selector of the element.
     * @returns {Promise<WebElement>} A promise that resolves to the WebElement found.
     */
    getByCss(name: string): Promise<WebElement>;
    /**
     * Finds an element by its ID.
     *
     * @param {string} id - The ID of the element.
     * @returns {Promise<WebElement>} A promise that resolves to the WebElement found.
     */
    getById(id: string): Promise<WebElement>;
    /**
     * Finds an element by its XPath.
     *
     * @param {string} xpath - The XPath query of the element.
     * @returns {Promise<WebElement>} A promise that resolves to the WebElement found.
     */
    getByXpath(xpath: string): Promise<WebElement>;
    /**
     * Finds an element by its class name.
     *
     * @param {string} className - The class name of the element.
     * @returns {Promise<WebElement>} A promise that resolves to the WebElement found.
     */
    getByClassName(className: string): Promise<WebElement>;
    /**
     * Finds an element by its name attribute.
     *
     * @param {string} name - The name attribute of the element.
     * @returns {Promise<WebElement>} A promise that resolves to the WebElement found.
     */
    getByName(name: string): Promise<WebElement>;
}
import { WebElement } from 'selenium-webdriver';
//# sourceMappingURL=element.d.ts.map