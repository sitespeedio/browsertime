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
     * @param {string} id - The ID of the element to wait for.
     * @param {number} maxTime - Maximum time to wait in milliseconds.
     * @returns {Promise<void>} A promise that resolves when the element is found or the time times out.
     * @throws {Error} Throws an error if the element is not found within the specified time.
     */
    byId(id: string, maxTime: number): Promise<void>;
    /**
     * Waits for an element with a specific ID to be located and visible within a maximum time.
     *
     * @async
     * @param {string} id - The ID of the element to wait for.
     * @param {number} maxTime - Maximum time to wait in milliseconds.
     * @returns {Promise<void>} A promise that resolves when the element is found or the time times out.
     * @throws {Error} Throws an error if the element is not found within the specified time.
     */
    byIdAndVisible(id: string, maxTime?: number): Promise<void>;
    /**
     * Waits for an element located by XPath to appear within a maximum time.
     *
     * @async
     * @param {string} xpath - The XPath of the element to wait for.
     * @param {number} maxTime - Maximum time to wait in milliseconds.
     * @returns {Promise<void>} A promise that resolves when the element is found or the time times out.
     * @throws {Error} Throws an error if the element is not found within the specified time.
     */
    byXpath(xpath: string, maxTime: number): Promise<void>;
    /**
     * Waits for an element located by a CSS selector to appear within a maximum time.
     *
     * @async
     * @param {string} selector - The CSS selector of the element to wait for.
     * @param {number} maxTime - Maximum time to wait in milliseconds.
     * @returns {Promise<void>} A promise that resolves when the element is found or the time times out.
     * @throws {Error} Throws an error if the element is not found within the specified time.
     */
    bySelector(selector: string, maxTime: number): Promise<void>;
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