/**
 * Provides functionality to wait for different conditions in the browser.
 *
 * @class
 * @hideconstructor
 */
export class Wait {
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
     * Waits for an element with a specific ID to be located within a maximum time.
     *
     * @async
     * @private
     * @param {string} id - The ID of the element to wait for.
     * @param {number} maxTime - Maximum time to wait in milliseconds.
     * @returns {Promise<void>} A promise that resolves when the element is found or the time times out.
     * @throws {Error} Throws an error if the element is not found within the specified time.
     */
    private byId;
    /**
     * Waits for an element with a specific ID to be located and visible within a maximum time.
     *
     * @async
     * @private
     * @param {string} id - The ID of the element to wait for.
     * @param {number} maxTime - Maximum time to wait in milliseconds.
     * @returns {Promise<void>} A promise that resolves when the element is found or the time times out.
     * @throws {Error} Throws an error if the element is not found within the specified time.
     */
    private byIdAndVisible;
    /**
     * Waits for an element located by XPath to appear within a maximum time.
     *
     * @async
     * @private
     * @param {string} xpath - The XPath of the element to wait for.
     * @param {number} maxTime - Maximum time to wait in milliseconds.
     * @returns {Promise<void>} A promise that resolves when the element is found or the time times out.
     * @throws {Error} Throws an error if the element is not found within the specified time.
     */
    private byXpath;
    /**
     * Waits for an element located by XPath to appear and visible within a maximum time.
     *
     * @async
     * @private
     * @param {string} xpath - The XPath of the element to wait for.
     * @param {number} maxTime - Maximum time to wait in milliseconds.
     * @returns {Promise<void>} A promise that resolves when the element is found or the time times out.
     * @throws {Error} Throws an error if the element is not found within the specified time.
     */
    private byXpathAndVisible;
    /**
     * Waits for an element located by a CSS selector to appear within a maximum time.
     *
     * @async
     * @private
     * @param {string} selector - The CSS selector of the element to wait for.
     * @param {number} maxTime - Maximum time to wait in milliseconds.
     * @returns {Promise<void>} A promise that resolves when the element is found or the time times out.
     * @throws {Error} Throws an error if the element is not found within the specified time.
     */
    private bySelector;
    /**
     * Waits for an element located by a CSS selector to be visible within a maximum time.
     *
     * @async
     * @private
     * @param {string} selector - The CSS selector of the element to wait for.
     * @param {number} maxTime - Maximum time to wait in milliseconds.
     * @returns {Promise<void>} A promise that resolves when the element is found or the time times out.
     * @throws {Error} Throws an error if the element is not found within the specified time.
     */
    private bySelectorAndVisible;
    /**
     * Waits for a specified amount of time.
     *
     * @async
     * @example async commands.wait.byTime(1000);
     * @param {number} ms - The time in milliseconds to wait.
     * @returns {Promise<void>} A promise that resolves when the specified time has elapsed.
     */
    byTime(ms: number): Promise<void>;
    /**
     * Waits for the page to finish loading.
     * @async
     * @example async commands.wait.byPageToComplete();
     * @returns {Promise<void>} A promise that resolves when the page complete check has finished.
     */
    byPageToComplete(): Promise<void>;
    /**
     * Waits for an element using a unified selector string to appear within a maximum time.
     * Supports CSS selectors (default), and prefix-based strategies:
     * 'id:myId', 'xpath://div', 'name:field', 'class:loaded'.
     *
     * @async
     * @param {string} selector - The selector string. CSS by default, or use a prefix.
     * @param {Object} [options] - Options for waiting.
     * @param {number} [options.timeout=6000] - Maximum time to wait in milliseconds.
     * @param {boolean} [options.visible=false] - If true, waits for the element to be visible, not just present.
     * @returns {Promise<void>} A promise that resolves when the element is found.
     * @throws {Error} Throws an error if the element is not found within the timeout.
     */
    run(selector: string, options?: {
        timeout?: number;
        visible?: boolean;
    }): Promise<void>;
    /**
     * Waits for a JavaScript condition to return a truthy value within a maximum time.
     *
     * @async
     * @param {string} jsExpression - The JavaScript expression to evaluate.
     * @param {number} maxTime - Maximum time to wait in milliseconds.
     * @returns {Promise<void>} A promise that resolves when the condition becomes truthy or the time times out.
     * @throws {Error} Throws an error if the condition is not met within the specified time.
     */
    byCondition(jsExpression: string, maxTime: number): Promise<void>;
}
//# sourceMappingURL=wait.d.ts.map