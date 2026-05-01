/**
 * Provides functionality to perform a double-click action on elements in a web page.
 *
 * @class
 * @hideconstructor
 */
export class DoubleClick {
    constructor(browser: any, pageCompleteCheck: any, options: any);
    /**
     * @private
     */
    private browser;
    /**
     * @private
     */
    private actions;
    /**
     * @private
     */
    private pageCompleteCheck;
    /**
     * @private
     */
    private options;
    /**
     * @private
     */
    private _waitForElement;
    /**
     * Performs a double click on an element using a unified selector string.
     *
     * @async
     * @param {string} selector - The selector string. CSS by default, or use a prefix.
     * @returns {Promise<void>}
     * @throws {Error} Throws an error if the element is not found.
     */
    run(selector: string): Promise<void>;
    /**
     * @private
     * Performs a mouse double-click on an element matching a given XPath selector.
     *
     * @async
     * @param {string} xpath - The XPath selector of the element to double-click.
     * @param {Object} [options] - Additional options for the double-click action.
     * @returns {Promise<void>} A promise that resolves when the double-click action is performed.
     * @throws {Error} Throws an error if the element is not found.
     */
    private byXpath;
    /**
     * @private
     * Performs a mouse double-click on an element matching a given CSS selector.
     *
     * @async
     * @param {string} selector - The CSS selector of the element to double-click.
     * @param {Object} [options] - Additional options for the double-click action.
     * @returns {Promise<void>} A promise that resolves when the double-click action is performed.
     * @throws {Error} Throws an error if the element is not found.
     */
    private bySelector;
    /**
     * @private
     * Performs a mouse double-click at the current cursor position.
     *
     * @async
     * @param {Object} [options] - Additional options for the double-click action.
     * @returns {Promise<void>} A promise that resolves when the double-click occurs.
     * @throws {Error} Throws an error if the double-click action cannot be performed.
     */
    private atCursor;
}
//# sourceMappingURL=doubleClick.d.ts.map