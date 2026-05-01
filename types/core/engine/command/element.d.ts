/**
 * This class provides a way to get hokld of Seleniums WebElements.
 * @class
 * @hideconstructor
 */
export class Element {
    constructor(browser: any, options: any);
    /**
     * @private
     */
    private driver;
    /**
     * @private
     */
    private options;
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
    find(selector: string, options?: {
        timeout?: number;
        visible?: boolean;
    }): Promise<WebElement>;
}
import { WebElement } from 'selenium-webdriver';
//# sourceMappingURL=element.d.ts.map