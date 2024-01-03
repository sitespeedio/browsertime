export class AddText {
    constructor(browser: any);
    browser: any;
    /**
     * Add text to an element with Selenium sendKeys.
     * @param {string} text The text string that you want to add
     * @param {string} id The id of the element
     * @returns {Promise} Promise object represents when the text has been
     * added to the field
     * @throws Will throw an error if the element is not found
     */
    byId(text: string, id: string): Promise<any>;
    /**
     * Add text to an element with Selenium sendKeys.
     * @param {string} text The text string that you want to add
     * @param {string} xpath The xpath to the element
     * @returns {Promise} Promise object represents when the text has been
     * added to the field
     * @throws Will throw an error if the element is not found
     */
    byXpath(text: string, xpath: string): Promise<any>;
    /**
     * Add text to an element with Selenium sendKeys.
     * @param {string} text The text string that you want to add
     * @param {string} selector The CSS selector to the element
     * @returns {Promise} Promise object represents when the text has been
     * added to the field
     * @throws Will throw an error if the element is not found
     */
    bySelector(text: string, selector: string): Promise<any>;
    /**
     * Add text to an element with Selenium sendKeys.
     * @param {string} text The text string that you want to add
     * @param {string} className A specific class name
     * @returns {Promise} Promise object represents when the text has been
     * added to the field
     * @throws Will throw an error if the element is not found
     */
    byClassName(text: string, className: string): Promise<any>;
    /**
     * Add text to an element with Selenium sendKeys.
     * @param {string} text The text string that you want to add
     * @param {string} name Element whose name attribute has the given value.
     * @returns {Promise} Promise object represents when the text has been
     * added to the field
     * @throws Will throw an error if the element is not found
     */
    byName(text: string, name: string): Promise<any>;
}
//# sourceMappingURL=addText.d.ts.map