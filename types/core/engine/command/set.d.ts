/**
 * Provides functionality to set properties like innerHTML, innerText, and value on elements in a web page.
 *
 * @class
 * @hideconstructor
 */
export class Set {
    constructor(browser: any, options: any);
    /**
     * @private
     */
    private browser;
    /**
     * @private
     */
    private options;
    /**
     * @private
     */
    private _waitForElement;
    /**
     * Sets a property on an element using a unified selector string.
     * Supports CSS selectors (default), and prefix-based strategies:
     * 'id:myId', 'xpath://input', 'name:field', 'class:input-field'.
     *
     * @async
     * @param {string} selector - The selector string for the element.
     * @param {string} value - The value to set.
     * @param {string} [property='value'] - The property to set: 'value', 'innerText', or 'innerHTML'.
     * @returns {Promise<void>} A promise that resolves when the property is set.
     * @throws {Error} Throws an error if the element is not found.
     */
    run(selector: string, value: string, property?: string): Promise<void>;
    /**
     * Sets the innerHTML of an element using a CSS selector.
     *
     * @async
     * @private
     * @param {string} html - The HTML string to set as innerHTML.
     * @param {string} selector - The CSS selector of the element.
     * @returns {Promise<void>} A promise that resolves when the innerHTML is set.
     * @throws {Error} Throws an error if the element is not found.
     */
    private innerHtml;
    /**
     * Sets the innerHTML of an element using its ID.
     *
     * @async
     * @private
     * @param {string} html - The HTML string to set as innerHTML.
     * @param {string} id - The ID of the element.
     * @returns {Promise<void>} A promise that resolves when the innerHTML is set.
     * @throws {Error} Throws an error if the element is not found.
     */
    private innerHtmlById;
    /**
     * Sets the innerText of an element using a CSS selector.
     *
     * @async
     * @private
     * @param {string} text - The text to set as innerText.
     * @param {string} selector - The CSS selector of the element.
     * @returns {Promise<void>} A promise that resolves when the innerText is set.
     * @throws {Error} Throws an error if the element is not found.
     */
    private innerText;
    /**
     * Sets the innerText of an element using its ID.
     *
     * @async
     * @private
     * @param {string} text - The text to set as innerText.
     * @param {string} id - The ID of the element.
     * @returns {Promise<void>} A promise that resolves when the innerText is set.
     * @throws {Error} Throws an error if the element is not found.
     */
    private innerTextById;
    /**
     * Sets the value of an element using a CSS selector.
     *
     * @async
     * @private
     * @param {string} value - The value to set on the element.
     * @param {string} selector - The CSS selector of the element.
     * @returns {Promise<void>} A promise that resolves when the value is set.
     * @throws {Error} Throws an error if the element is not found.
     */
    private value;
    /**
     * Sets the value of an element using its ID.
     *
     * @async
     * @private
     * @param {string} value - The value to set on the element.
     * @param {string} id - The ID of the element.
     * @returns {Promise<void>} A promise that resolves when the value is set.
     * @throws {Error} Throws an error if the element is not found.
     */
    private valueById;
}
//# sourceMappingURL=set.d.ts.map