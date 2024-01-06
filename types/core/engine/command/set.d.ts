/**
 * Provides functionality to set properties like innerHTML, innerText, and value on elements in a web page.
 *
 * @class
 * @hideconstructor
 */
export class Set {
    constructor(browser: any);
    /**
     * @private
     */
    private browser;
    /**
     * Sets the innerHTML of an element using a CSS selector.
     *
     * @async
     * @param {string} html - The HTML string to set as innerHTML.
     * @param {string} selector - The CSS selector of the element.
     * @returns {Promise<void>} A promise that resolves when the innerHTML is set.
     * @throws {Error} Throws an error if the element is not found.
     */
    innerHtml(html: string, selector: string): Promise<void>;
    /**
     * Sets the innerHTML of an element using its ID.
     *
     * @async
     * @param {string} html - The HTML string to set as innerHTML.
     * @param {string} id - The ID of the element.
     * @returns {Promise<void>} A promise that resolves when the innerHTML is set.
     * @throws {Error} Throws an error if the element is not found.
     */
    innerHtmlById(html: string, id: string): Promise<void>;
    /**
     * Sets the innerText of an element using a CSS selector.
     *
     * @async
     * @param {string} text - The text to set as innerText.
     * @param {string} selector - The CSS selector of the element.
     * @returns {Promise<void>} A promise that resolves when the innerText is set.
     * @throws {Error} Throws an error if the element is not found.
     */
    innerText(text: string, selector: string): Promise<void>;
    /**
     * Sets the innerText of an element using its ID.
     *
     * @async
     * @param {string} text - The text to set as innerText.
     * @param {string} id - The ID of the element.
     * @returns {Promise<void>} A promise that resolves when the innerText is set.
     * @throws {Error} Throws an error if the element is not found.
     */
    innerTextById(text: string, id: string): Promise<void>;
    /**
     * Sets the value of an element using a CSS selector.
     *
     * @async
     * @param {string} value - The value to set on the element.
     * @param {string} selector - The CSS selector of the element.
     * @returns {Promise<void>} A promise that resolves when the value is set.
     * @throws {Error} Throws an error if the element is not found.
     */
    value(value: string, selector: string): Promise<void>;
    /**
     * Sets the value of an element using its ID.
     *
     * @async
     * @param {string} value - The value to set on the element.
     * @param {string} id - The ID of the element.
     * @returns {Promise<void>} A promise that resolves when the value is set.
     * @throws {Error} Throws an error if the element is not found.
     */
    valueById(value: string, id: string): Promise<void>;
}
//# sourceMappingURL=set.d.ts.map