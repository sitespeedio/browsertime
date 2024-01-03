export class ContextClick {
    constructor(browser: any);
    driver: any;
    actions: any;
    /**
     * Perform ContextClick on an element that matches a XPath selector.
     * @param {string} xpath
     * @returns {Promise} Promise object represents when context click occurs.
     * @throws Will throw an error if the element is not found
     */
    byXpath(xpath: string): Promise<any>;
    /**
     * Perform ContextClick on an element that matches a CSS selector.
     * @param {string} css selector
     * @returns {Promise} Promise object represents when context click occurs.
     * @throws Will throw an error if the element is not found
     */
    bySelector(selector: any): Promise<any>;
    /**
     * Perform ContextClick at the cursor's position.
     * @returns {Promise} Promise object represents when context click occurs.
     * @throws Will throw an error if context click cannot be performed.
     */
    atCursor(): Promise<any>;
}
//# sourceMappingURL=contextClick.d.ts.map