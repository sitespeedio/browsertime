/**
 * Provides functionality to add text to elements on a web page using various selectors.
 * @class
 * @hideconstructor
 */
export class AddText {
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
     * @private
     */
    private _getUrl;
    /**
     * Adds text to an element using a unified selector string.
     * Supports CSS selectors (default), and prefix-based strategies:
     * 'id:myId', 'xpath://input', 'name:email', 'class:input-field'.
     *
     * @async
     * @param {string} selector - The selector string. CSS by default, or use a prefix.
     * @param {string} text - The text string to add.
     * @returns {Promise<void>} A promise that resolves when the text has been added.
     * @throws {Error} Throws an error if the element is not found.
     */
    run(selector: string, text: string): Promise<void>;
    /**
     * Adds text to an element identified by its ID.
     *
     * @async
     * @private
     * @example commands.addText.byId('mytext', 'id');
     * @param {string} text - The text string to add.
     * @param {string} id - The ID of the element.
     * @returns {Promise<void>} A promise that resolves when the text has been added.
     * @throws {Error} Throws an error if the element is not found.
     */
    private byId;
    /**
     * Adds text to an element identified by its XPath.
     *
     * @async
     * @private
     * @example commands.addText.byXpath('mytext', 'xpath');
     * @param {string} text - The text string to add.
     * @param {string} xpath - The XPath of the element.
     * @returns {Promise<void>} A promise that resolves when the text has been added.
     * @throws {Error} Throws an error if the element is not found.
     */
    private byXpath;
    /**
     * Adds text to an element identified by its CSS selector.
     *
     * @async
     * @private
     * @example commands.addText.bySelector('mytext', 'selector');
     * @param {string} text - The text string to add.
     * @param {string} selector - The CSS selector of the element.
     * @returns {Promise<void>} A promise that resolves when the text has been added.
     * @throws {Error} Throws an error if the element is not found.
     */
    private bySelector;
    /**
     * Adds text to an element identified by its class name.
     *
     * @async
     * @private
     * @example commands.addText.byClassName('mytext', 'className');
     * @param {string} text - The text string to add.
     * @param {string} className - The class name of the element.
     * @returns {Promise<void>} A promise that resolves when the text has been added.
     * @throws {Error} Throws an error if the element is not found.
     */
    private byClassName;
    /**
     * Adds text to an element identified by its name attribute.
     *
     * @async
     * @private
     * @example commands.addText.byName('mytext', 'name');
     * @param {string} text - The text string to add.
     * @param {string} name - The name attribute of the element.
     * @returns {Promise<void>} A promise that resolves when the text has been added.
     * @throws {Error} Throws an error if the element is not found.
     */
    private byName;
}
//# sourceMappingURL=addText.d.ts.map