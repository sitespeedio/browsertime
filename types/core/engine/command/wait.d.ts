export class Wait {
    constructor(browser: any, pageCompleteCheck: any);
    browser: any;
    pageCompleteCheck: any;
    /**
     * Wait for an element with id to appear for maxTime.
     * @param {string} id The id to wait for
     * @param {number} maxTime Max time to wait in ms
     * @returns {Promise} Promise object represents when the element is found or the time times out
     * @throws Will throw an error if the element is not found
     */
    byId(id: string, maxTime: number): Promise<any>;
    /**
     * Wait for an element with xpath to appear for maxTime.
     * @param {string} xpath The xpath to wait for
     * @param {number} maxTime Max time to wait in ms
     * @returns {Promise} Promise object represents when the element is found or the time times out
     * @throws Will throw an error if the element is not found
     */
    byXpath(xpath: string, maxTime: number): Promise<any>;
    /**
     * Wait for an element that you find by a selector to appear for maxTime.
     * @param {string} selector The selector to find the element to wait for
     * @param {number} maxTime Max time to wait in ms
     * @returns {Promise} Promise object represents when the element is found or the time times out
     * @throws Will throw an error if the element is not found
     */
    bySelector(selector: string, maxTime: number): Promise<any>;
    /**
     * Wait for x ms.
     * @param {number} ms The tine in ms to wait.
     * @returns {Promise} Promise object represents when the time has timed out.
     */
    byTime(ms: number): Promise<any>;
    /**
     * Wait for the page to finish loading.
     * @returns {Promise} Promise object represents when the pageCompleteCheck has finished.
     */
    byPageToComplete(): Promise<any>;
    /**
     * Wait for an condition that will eventually return a truthy-value for maxTime.
     * @param {string} jsExpression The js code condition to wait for
     * @param {number} maxTime Max time to wait in ms
     * @returns {Promise} Promise object represents when the expression becomes truthy or the time times out
     * @throws Will throw an error if the condition returned false
     */
    byCondition(jsExpression: string, maxTime: number): Promise<any>;
}
//# sourceMappingURL=wait.d.ts.map