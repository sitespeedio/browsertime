/**
 * Provides functionality to add text to elements on a web page using various selectors.
 *
 * @class
 */
export class AddText {
    constructor(browser: any);
    /**
     * @private
     */
    private browser;
    /**
     * Adds text to an element identified by its ID.
     *
     * @async
     * @param {string} text - The text string to add.
     * @param {string} id - The ID of the element.
     * @returns {Promise<void>} A promise that resolves when the text has been added.
     * @throws {Error} Throws an error if the element is not found.
     */
    byId(text: string, id: string): Promise<void>;
    /**
     * Adds text to an element identified by its XPath.
     *
     * @async
     * @param {string} text - The text string to add.
     * @param {string} xpath - The XPath of the element.
     * @returns {Promise<void>} A promise that resolves when the text has been added.
     * @throws {Error} Throws an error if the element is not found.
     */
    byXpath(text: string, xpath: string): Promise<void>;
    /**
     * Adds text to an element identified by its CSS selector.
     *
     * @async
     * @param {string} text - The text string to add.
     * @param {string} selector - The CSS selector of the element.
     * @returns {Promise<void>} A promise that resolves when the text has been added.
     * @throws {Error} Throws an error if the element is not found.
     */
    bySelector(text: string, selector: string): Promise<void>;
    /**
     * Adds text to an element identified by its class name.
     *
     * @async
     * @param {string} text - The text string to add.
     * @param {string} className - The class name of the element.
     * @returns {Promise<void>} A promise that resolves when the text has been added.
     * @throws {Error} Throws an error if the element is not found.
     */
    byClassName(text: string, className: string): Promise<void>;
    /**
     * Adds text to an element identified by its name attribute.
     *
     * @async
     * @param {string} text - The text string to add.
     * @param {string} name - The name attribute of the element.
     * @returns {Promise<void>} A promise that resolves when the text has been added.
     * @throws {Error} Throws an error if the element is not found.
     */
    byName(text: string, name: string): Promise<void>;
}
//# sourceMappingURL=addText.d.ts.map