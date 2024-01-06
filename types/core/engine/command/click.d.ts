/**
 * Provides functionality to perform click actions on elements in a web page using various selectors.
 *
 * @class
 * @hideconstructor
 */
export class Click {
    constructor(browser: any, pageCompleteCheck: any);
    /**
     * @private
     */
    private browser;
    /**
     * @private
     */
    private pageCompleteCheck;
    /**
     * Clicks on an element identified by its class name.
     *
     * @async
     * @param {string} className - The class name of the element to click.
     * @returns {Promise<void>} A promise that resolves when the click action is performed.
     * @throws {Error} Throws an error if the element is not found.
     */
    byClassName(className: string): Promise<void>;
    /**
     * Clicks on an element identified by its class name and waits for the page complete check to finish.
     *
     * @async
     * @param {string} className - The class name of the element to click.
     * @returns {Promise<void>} A promise that resolves when the click action and page complete check are finished.
     * @throws {Error} Throws an error if the element is not found.
     */
    byClassNameAndWait(className: string): Promise<void>;
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
     * Clicks on a link whose visible text matches the given string and waits for the page complete check to finish.
     *
     * @async
     * @param {string} text - The visible text of the link to click.
     * @returns {Promise<void>} A promise that resolves when the click action and page complete check are finished.
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
     * Clicks on a link whose visible text contains the given substring and waits for the page complete check to finish.
     *
     * @async
     * @param {string} text - The substring of the visible text of the link to click.
     * @returns {Promise<void>} A promise that resolves when the click action and page complete check are finished.
     * @throws {Error} Throws an error if the link is not found.
     */
    byPartialLinkTextAndWait(text: string): Promise<void>;
    /**
     * Clicks on an element that matches a given XPath selector.
     *
     * @async
     * @param {string} xpath - The XPath selector of the element to click.
     * @returns {Promise<void>} A promise that resolves when the click action is performed.
     * @throws {Error} Throws an error if the element is not found.
     */
    byXpath(xpath: string): Promise<void>;
    /**
     * Clicks on an element that matches a given XPath selector and waits for the page complete check to finish.
     *
     * @async
     * @param {string} xpath - The XPath selector of the element to click.
     * @returns {Promise<void>} A promise that resolves when the click action and page complete check are finished.
     * @throws {Error} Throws an error if the element is not found.
     */
    byXpathAndWait(xpath: string): Promise<void>;
    /**
     * Clicks on an element located by evaluating a JavaScript expression.
     *
     * @async
     * @param {string} js - The JavaScript expression that evaluates to an element or list of elements.
     * @returns {Promise<void>} A promise that resolves when the click action is performed.
     * @throws {Error} Throws an error if the element is not found.
     */
    byJs(js: string): Promise<void>;
    /**
     * Clicks on an element located by evaluating a JavaScript expression and waits for the page complete check to finish.
     *
     * @async
     * @param {string} js - The JavaScript expression that evaluates to an element or list of elements.
     * @returns {Promise<void>} A promise that resolves when the click action and page complete check are finished.
     * @throws {Error} Throws an error if the element is not found.
     */
    byJsAndWait(js: string): Promise<void>;
    /**
     * Clicks on an element located by its ID.
     *
     * @async
     * @param {string} id - The ID of the element to click.
     * @returns {Promise<void>} A promise that resolves when the click action is performed.
     * @throws {Error} Throws an error if the element is not found.
     */
    byId(id: string): Promise<void>;
    /**
     * Clicks on an element located by its name attribute.
     *
     * @async
     * @param {string} name - The name attribute of the element to click.
     * @returns {Promise<void>} A promise that resolves when the click action is performed.
     * @throws {Error} Throws an error if the element is not found.
     */
    byName(name: string): Promise<void>;
    /**
     * Click on link located by the ID attribute. Uses document.getElementById() to find the element. And wait for page complete check to finish.
     * @param {string} id
     * @returns {Promise<void>} Promise object represents when the element has been clicked and the pageCompleteCheck has finished.
     * @throws Will throw an error if the element is not found
     */
    byIdAndWait(id: string): Promise<void>;
    /**
     * Clicks on an element located by its CSS selector.
     *
     * @async
     * @param {string} selector - The CSS selector of the element to click.
     * @returns {Promise<void>} A promise that resolves when the click action is performed.
     * @throws {Error} Throws an error if the element is not found.
     */
    bySelector(selector: string): Promise<void>;
    /**
     * Clicks on an element located by its CSS selector and waits for the page complete check to finish.
     *
     * @async
     * @param {string} selector - The CSS selector of the element to click.
     * @returns {Promise<void>} A promise that resolves when the click action and page complete check are finished.
     * @throws {Error} Throws an error if the element is not found.
     */
    bySelectorAndWait(selector: string): Promise<void>;
}
//# sourceMappingURL=click.d.ts.map