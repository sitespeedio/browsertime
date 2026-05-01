/**
 * Provides functionality to perform click actions on elements in a web page using various selectors.
 * Uses the Selenium Actions API to generate real OS-level mouse events, which means
 * the element must be visible and interactable. If you need to click a hidden element,
 * use {@link JavaScript#run commands.js.run} to trigger a JavaScript click instead.
 *
 * @class
 * @hideconstructor
 */
export class Click {
    constructor(browser: any, pageCompleteCheck: any, options: any);
    /**
     * @private
     */
    private browser;
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
     * @private
     */
    private _andWait;
    /**
     * @private
     */
    private _clickElement;
    /**
     * Clicks on an element using a unified selector string.
     * Supports CSS selectors (default), and prefix-based strategies:
     * 'id:myId', 'xpath://button', 'text:Submit', 'link:Click here', 'name:email', 'class:btn'.
     *
     * @async
     * @param {string} selector - The selector string. CSS by default, or use a prefix like 'id:', 'xpath:', 'text:', 'link:', 'name:', 'class:'.
     * @param {Object} [options] - Options for the click action.
     * @param {boolean} [options.waitForNavigation=false] - If true, waits for the page complete check after clicking.
     * @returns {Promise<void>} A promise that resolves when the click action is performed.
     * @throws {Error} Throws an error if the element is not found.
     */
    run(selector: string, options?: {
        waitForNavigation?: boolean;
    }): Promise<void>;
    /**
     * Clicks on an element identified by its class name.
     *
     * @async
     * @private
     * @param {string} className - The class name of the element to click.
     * @returns {Promise<void>} A promise that resolves when the click action is performed.
     * @throws {Error} Throws an error if the element is not found.
     */
    private byClassName;
    /**
     * Clicks on an element identified by its class name and waits for the page complete check to finish.
     *
     * @async
     * @private
     * @param {string} className - The class name of the element to click.
     * @returns {Promise<void>} A promise that resolves when the click action and page complete check are finished.
     * @throws {Error} Throws an error if the element is not found.
     */
    private byClassNameAndWait;
    /**
     * Clicks on a link whose visible text matches the given string.
     *
     * @async
     * @private
     * @param {string} text - The visible text of the link to click.
     * @returns {Promise<void>} A promise that resolves when the click action is performed.
     * @throws {Error} Throws an error if the link is not found.
     */
    private byLinkText;
    /**
     * Clicks on a link whose visible text matches the given string and waits for the page complete check to finish.
     *
     * @async
     * @private
     * @param {string} text - The visible text of the link to click.
     * @returns {Promise<void>} A promise that resolves when the click action and page complete check are finished.
     * @throws {Error} Throws an error if the link is not found.
     */
    private byLinkTextAndWait;
    /**
     * Clicks on a link whose visible text contains the given substring.
     *
     * @async
     * @private
     * @param {string} text - The substring of the visible text of the link to click.
     * @returns {Promise<void>} A promise that resolves when the click action is performed.
     * @throws {Error} Throws an error if the link is not found.
     */
    private byPartialLinkText;
    /**
     * Clicks on a link whose visible text contains the given substring and waits for the page complete check to finish.
     *
     * @async
     * @private
     * @param {string} text - The substring of the visible text of the link to click.
     * @returns {Promise<void>} A promise that resolves when the click action and page complete check are finished.
     * @throws {Error} Throws an error if the link is not found.
     */
    private byPartialLinkTextAndWait;
    /**
     * Clicks on an element whose visible text matches the given string.
     * This works on any element type, not just links.
     *
     * @async
     * @private
     * @param {string} text - The visible text of the element to click.
     * @returns {Promise<void>} A promise that resolves when the click action is performed.
     * @throws {Error} Throws an error if the element is not found.
     */
    private byText;
    /**
     * Clicks on an element whose visible text matches the given string and waits for the page complete check to finish.
     * This works on any element type, not just links.
     *
     * @async
     * @private
     * @param {string} text - The visible text of the element to click.
     * @returns {Promise<void>} A promise that resolves when the click action and page complete check are finished.
     * @throws {Error} Throws an error if the element is not found.
     */
    private byTextAndWait;
    /**
     * Clicks on an element that matches a given XPath selector.
     *
     * @async
     * @private
     * @param {string} xpath - The XPath selector of the element to click.
     * @returns {Promise<void>} A promise that resolves when the click action is performed.
     * @throws {Error} Throws an error if the element is not found.
     */
    private byXpath;
    /**
     * Clicks on an element that matches a given XPath selector and waits for the page complete check to finish.
     *
     * @async
     * @private
     * @param {string} xpath - The XPath selector of the element to click.
     * @returns {Promise<void>} A promise that resolves when the click action and page complete check are finished.
     * @throws {Error} Throws an error if the element is not found.
     */
    private byXpathAndWait;
    /**
     * Clicks on an element located by evaluating a JavaScript expression.
     *
     * @async
     * @private
     * @param {string} js - The JavaScript expression that evaluates to an element or list of elements.
     * @returns {Promise<void>} A promise that resolves when the click action is performed.
     * @throws {Error} Throws an error if the element is not found.
     */
    private byJs;
    /**
     * Clicks on an element located by evaluating a JavaScript expression and waits for the page complete check to finish.
     *
     * @async
     * @private
     * @param {string} js - The JavaScript expression that evaluates to an element or list of elements.
     * @returns {Promise<void>} A promise that resolves when the click action and page complete check are finished.
     * @throws {Error} Throws an error if the element is not found.
     */
    private byJsAndWait;
    /**
     * Clicks on an element located by its ID.
     *
     * @async
     * @private
     * @param {string} id - The ID of the element to click.
     * @returns {Promise<void>} A promise that resolves when the click action is performed.
     * @throws {Error} Throws an error if the element is not found.
     */
    private byId;
    /**
     * Clicks on an element located by its name attribute.
     *
     * @async
     * @private
     * @param {string} name - The name attribute of the element to click.
     * @returns {Promise<void>} A promise that resolves when the click action is performed.
     * @throws {Error} Throws an error if the element is not found.
     */
    private byName;
    /**
     * Click on link located by the ID attribute. Uses document.getElementById() to find the element. And wait for page complete check to finish.
     * @private
     * @param {string} id
     * @returns {Promise<void>} Promise object represents when the element has been clicked and the pageCompleteCheck has finished.
     * @throws Will throw an error if the element is not found
     */
    private byIdAndWait;
    /**
     * Clicks on an element located by its CSS selector.
     *
     * @async
     * @private
     * @param {string} selector - The CSS selector of the element to click.
     * @returns {Promise<void>} A promise that resolves when the click action is performed.
     * @throws {Error} Throws an error if the element is not found.
     */
    private bySelector;
    /**
     * Clicks on an element located by its CSS selector and waits for the page complete check to finish.
     *
     * @async
     * @private
     * @param {string} selector - The CSS selector of the element to click.
     * @returns {Promise<void>} A promise that resolves when the click action and page complete check are finished.
     * @throws {Error} Throws an error if the element is not found.
     */
    private bySelectorAndWait;
}
//# sourceMappingURL=click.d.ts.map