/**
 * Provides functionality to perform a single click action on elements or at specific positions in a web page.
 *
 * @class
 */
export class SingleClick {
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
     * Performs a single mouse click on an element matching a given XPath selector.
     *
     * @async
     * @param {string} xpath - The XPath selector of the element to click.
     * @param {Object} [options] - Additional options for the click action.
     * @returns {Promise<void>} A promise that resolves when the single click action is performed.
     * @throws {Error} Throws an error if the element is not found.
     */
    byXpath(xpath: string, options?: any): Promise<void>;
    /**
     * Performs a single mouse click on an element matching a given CSS selector.
     *
     * @async
     * @param {string} selector - The CSS selector of the element to click.
     * @param {Object} [options] - Additional options for the click action.
     * @returns {Promise<void>} A promise that resolves when the single click action is performed.
     * @throws {Error} Throws an error if the element is not found.
     */
    bySelector(selector: string, options?: any): Promise<void>;
    /**
     * Performs a single mouse click at the current cursor position.
     *
     * @async
     * @param {Object} [options] - Additional options for the click action.
     * @returns {Promise<void>} A promise that resolves when the single click occurs.
     * @throws {Error} Throws an error if the single click action cannot be performed.
     */
    atCursor(options?: any): Promise<void>;
}
//# sourceMappingURL=singleClick.d.ts.map