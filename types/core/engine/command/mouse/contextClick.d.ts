/**
 * Provides functionality to perform a context click (right-click) on elements in a web page.
 *
 * @class
 * @hideconstructor
 */
export class ContextClick {
    constructor(browser: any, options: any);
    /**
     * @private
     */
    private browser;
    /**
     * @private
     */
    private driver;
    /**
     * @private
     */
    private actions;
    /**
     * @private
     */
    private options;
    /**
     * @private
     */
    private _waitForElement;
    /**
     * Performs a context click (right-click) on an element using a unified selector string.
     *
     * @async
     * @param {string} selector - The selector string. CSS by default, or use a prefix.
     * @returns {Promise<void>}
     * @throws {Error} Throws an error if the element is not found.
     */
    run(selector: string): Promise<void>;
    /**
     * @private
     * Performs a context click (right-click) on an element that matches a given XPath selector.
     *
     * @async
     * @param {string} xpath - The XPath selector of the element to context click.
     * @returns {Promise<void>} A promise that resolves when the context click action is performed.
     * @throws {Error} Throws an error if the element is not found.
     */
    private byXpath;
    /**
     * @private
     * Performs a context click (right-click) on an element that matches a given CSS selector.
     *
     * @async
     * @param {string} selector - The CSS selector of the element to context click.
     * @returns {Promise<void>} A promise that resolves when the context click action is performed.
     * @throws {Error} Throws an error if the element is not found.
     */
    private bySelector;
    /**
     * @private
     * Performs a context click (right-click) at the current cursor position.
     *
     * @async
     * @returns {Promise<void>} A promise that resolves when the context click action is performed.
     * @throws {Error} Throws an error if the context click action cannot be performed.
     */
    private atCursor;
}
//# sourceMappingURL=contextClick.d.ts.map