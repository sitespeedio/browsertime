/**
 * Provides functionality to perform a single click action on elements or at specific positions in a web page. Uses Seleniums Action API.
 *
 * @hideconstructor
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
     * Performs a single mouse click on an element matching a given XPath selector and wait for page complete check.
     *
     * @async
     * @param {string} xpath - The XPath selector of the element to click.
     * @returns {Promise<void>} A promise that resolves when the single click action is performed.
     * @throws {Error} Throws an error if the element is not found.
     */
    byXpathAndWait(xpath: string): Promise<void>;
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
     * Performs a single mouse click on an element matching a given CSS selector and waits on the page complete check.
     *
     * @async
     * @param {string} selector - The CSS selector of the element to click.
     * @returns {Promise<void>} A promise that resolves when the single click action is performed.
     * @throws {Error} Throws an error if the element is not found.
     */
    bySelectorAndWait(selector: string): Promise<void>;
    /**
     * Performs a single mouse click at the current cursor position.
     *
     * @async
     * @param {Object} [options] - Additional options for the click action.
     * @returns {Promise<void>} A promise that resolves when the single click occurs.
     * @throws {Error} Throws an error if the single click action cannot be performed.
     */
    atCursor(options?: any): Promise<void>;
    /**
     * Performs a single mouse click at the current cursor position and waits on the
     * page complete check.
     *
     * @async
     * @returns {Promise<void>} A promise that resolves when the single click occurs.
     * @throws {Error} Throws an error if the single click action cannot be performed.
     */
    atCursorAndWait(): Promise<void>;
    /**
     * Clicks on a link whose visible text matches the given string.
     *
     * @async
     * @param {string} text - The visible text of the link to click.
     * @returns {Promise<void>} A promise that resolves when the click action is performed.
     * @throws {Error} Throws an error if the link is not found.
     */
    byLinkText(text: string): Promise<void>;
    /**
     * Clicks on a link whose visible text matches the given string and waits on the opage complete check.
     *
     * @async
     * @param {string} text - The visible text of the link to click.
     * @returns {Promise<void>} A promise that resolves when the click action is performed.
     * @throws {Error} Throws an error if the link is not found.
     */
    byLinkTextAndWait(text: string): Promise<void>;
    /**
     * Clicks on a link whose visible text contains the given substring.
     *
     * @async
     * @param {string} text - The substring of the visible text of the link to click.
     * @returns {Promise<void>} A promise that resolves when the click action is performed.
     * @throws {Error} Throws an error if the link is not found.
     */
    byPartialLinkText(text: string): Promise<void>;
    /**
     * Clicks on a link whose visible text contains the given substring and waits on the
     * page complete check.
     *
     * @async
     * @param {string} text - The substring of the visible text of the link to click.
     * @returns {Promise<void>} A promise that resolves when the click action is performed.
     * @throws {Error} Throws an error if the link is not found.
     */
    byPartialLinkTextAndWait(text: string): Promise<void>;
    /**
     * Clicks on a element with a specific id.
     *
     * @async
     * @param {string} id - The id of the link to click.
     * @returns {Promise<void>} A promise that resolves when the click action is performed.
     * @throws {Error} Throws an error if the id is not found.
     */
    byId(id: string): Promise<void>;
    /**
     * Clicks on a element with a specific id and wait on the page complete check
     *
     * @async
     * @param {string} id - The id of the link to click.
     * @returns {Promise<void>} A promise that resolves when the page has completed.
     * @throws {Error} Throws an error if the id is not found.
     */
    byIdAndWait(id: string): Promise<void>;
}
//# sourceMappingURL=singleClick.d.ts.map