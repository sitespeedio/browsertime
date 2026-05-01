/**
 * Provides functionality to perform a single click action on elements or at specific positions in a web page. Uses Seleniums Action API.
 *
 * @hideconstructor
 * @class
 */
export class SingleClick {
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
     * Performs a single click on an element using a unified selector string.
     *
     * @async
     * @param {string} selector - The selector string. CSS by default, or use a prefix.
     * @param {Object} [options] - Options for the click action.
     * @param {boolean} [options.waitForNavigation=false] - If true, waits for page complete check.
     * @returns {Promise<void>}
     * @throws {Error} Throws an error if the element is not found.
     */
    run(selector: string, options?: {
        waitForNavigation?: boolean;
    }): Promise<void>;
    /**
     * @private
     */
    private _andWait;
    /**
     * @private
     * Performs a single mouse click on an element matching a given XPath selector.
     *
     * @async
     * @param {string} xpath - The XPath selector of the element to click.
     * @param {Object} [options] - Additional options for the click action.
     * @returns {Promise<void>} A promise that resolves when the single click action is performed.
     * @throws {Error} Throws an error if the element is not found.
     */
    private byXpath;
    /**
     * @private
     * Performs a single mouse click on an element matching a given XPath selector and wait for page complete check.
     *
     * @async
     * @param {string} xpath - The XPath selector of the element to click.
     * @returns {Promise<void>} A promise that resolves when the single click action is performed.
     * @throws {Error} Throws an error if the element is not found.
     */
    private byXpathAndWait;
    /**
     * @private
     * Performs a single mouse click on an element matching a given CSS selector.
     *
     * @async
     * @param {string} selector - The CSS selector of the element to click.
     * @param {Object} [options] - Additional options for the click action.
     * @returns {Promise<void>} A promise that resolves when the single click action is performed.
     * @throws {Error} Throws an error if the element is not found.
     */
    private bySelector;
    /**
     * @private
     * Performs a single mouse click on an element matching a given CSS selector and waits on the page complete check.
     *
     * @async
     * @param {string} selector - The CSS selector of the element to click.
     * @returns {Promise<void>} A promise that resolves when the single click action is performed.
     * @throws {Error} Throws an error if the element is not found.
     */
    private bySelectorAndWait;
    /**
     * @private
     * Performs a single mouse click at the current cursor position.
     *
     * @async
     * @param {Object} [options] - Additional options for the click action.
     * @returns {Promise<void>} A promise that resolves when the single click occurs.
     * @throws {Error} Throws an error if the single click action cannot be performed.
     */
    private atCursor;
    /**
     * @private
     * Performs a single mouse click at the current cursor position and waits on the
     * page complete check.
     *
     * @async
     * @returns {Promise<void>} A promise that resolves when the single click occurs.
     * @throws {Error} Throws an error if the single click action cannot be performed.
     */
    private atCursorAndWait;
    /**
     * @private
     * Clicks on a link whose visible text matches the given string.
     *
     * @async
     * @param {string} text - The visible text of the link to click.
     * @returns {Promise<void>} A promise that resolves when the click action is performed.
     * @throws {Error} Throws an error if the link is not found.
     */
    private byLinkText;
    /**
     * @private
     * Clicks on a link whose visible text matches the given string and waits on the opage complete check.
     *
     * @async
     * @param {string} text - The visible text of the link to click.
     * @returns {Promise<void>} A promise that resolves when the click action is performed.
     * @throws {Error} Throws an error if the link is not found.
     */
    private byLinkTextAndWait;
    /**
     * @private
     * Clicks on a link whose visible text contains the given substring.
     *
     * @async
     * @param {string} text - The substring of the visible text of the link to click.
     * @returns {Promise<void>} A promise that resolves when the click action is performed.
     * @throws {Error} Throws an error if the link is not found.
     */
    private byPartialLinkText;
    /**
     * @private
     * Clicks on a link whose visible text contains the given substring and waits on the
     * page complete check.
     *
     * @async
     * @param {string} text - The substring of the visible text of the link to click.
     * @returns {Promise<void>} A promise that resolves when the click action is performed.
     * @throws {Error} Throws an error if the link is not found.
     */
    private byPartialLinkTextAndWait;
    /**
     * @private
     * Clicks on a element with a specific id.
     *
     * @async
     * @param {string} id - The id of the link to click.
     * @returns {Promise<void>} A promise that resolves when the click action is performed.
     * @throws {Error} Throws an error if the id is not found.
     */
    private byId;
    /**
     * @private
     * Clicks on a element with a specific id and wait on the page complete check
     *
     * @async
     * @param {string} id - The id of the link to click.
     * @returns {Promise<void>} A promise that resolves when the page has completed.
     * @throws {Error} Throws an error if the id is not found.
     */
    private byIdAndWait;
}
//# sourceMappingURL=singleClick.d.ts.map