/**
 * Provides functionality to perform a context click (right-click) on elements in a web page.
 *
 * @class
 * @hideconstructor
 */
export class ContextClick {
    constructor(browser: any);
    /**
     * @private
     */
    private driver;
    /**
     * @private
     */
    private actions;
    /**
     * Performs a context click (right-click) on an element that matches a given XPath selector.
     *
     * @async
     * @param {string} xpath - The XPath selector of the element to context click.
     * @returns {Promise<void>} A promise that resolves when the context click action is performed.
     * @throws {Error} Throws an error if the element is not found.
     */
    byXpath(xpath: string): Promise<void>;
    /**
     * Performs a context click (right-click) on an element that matches a given CSS selector.
     *
     * @async
     * @param {string} selector - The CSS selector of the element to context click.
     * @returns {Promise<void>} A promise that resolves when the context click action is performed.
     * @throws {Error} Throws an error if the element is not found.
     */
    bySelector(selector: string): Promise<void>;
    /**
     * Performs a context click (right-click) at the current cursor position.
     *
     * @async
     * @returns {Promise<void>} A promise that resolves when the context click action is performed.
     * @throws {Error} Throws an error if the context click action cannot be performed.
     */
    atCursor(): Promise<void>;
}
//# sourceMappingURL=contextClick.d.ts.map