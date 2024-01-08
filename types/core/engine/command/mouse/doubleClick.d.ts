/**
 * Provides functionality to perform a double-click action on elements in a web page.
 *
 * @class
 * @hideconstructor
 */
export class DoubleClick {
    constructor(browser: any, pageCompleteCheck: any);
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
     * Performs a mouse double-click on an element matching a given XPath selector.
     *
     * @async
     * @param {string} xpath - The XPath selector of the element to double-click.
     * @param {Object} [options] - Additional options for the double-click action.
     * @returns {Promise<void>} A promise that resolves when the double-click action is performed.
     * @throws {Error} Throws an error if the element is not found.
     */
    byXpath(xpath: string, options?: any): Promise<void>;
    /**
     * Performs a mouse double-click on an element matching a given CSS selector.
     *
     * @async
     * @param {string} selector - The CSS selector of the element to double-click.
     * @param {Object} [options] - Additional options for the double-click action.
     * @returns {Promise<void>} A promise that resolves when the double-click action is performed.
     * @throws {Error} Throws an error if the element is not found.
     */
    bySelector(selector: string, options?: any): Promise<void>;
    /**
     * Performs a mouse double-click at the current cursor position.
     *
     * @async
     * @param {Object} [options] - Additional options for the double-click action.
     * @returns {Promise<void>} A promise that resolves when the double-click occurs.
     * @throws {Error} Throws an error if the double-click action cannot be performed.
     */
    atCursor(options?: any): Promise<void>;
}
//# sourceMappingURL=doubleClick.d.ts.map