export class DoubleClick {
    constructor(browser: any, pageCompleteCheck: any);
    browser: any;
    actions: any;
    pageCompleteCheck: any;
    /**
     * Perform mouse double click on an element matches a XPath selector.
     * @param {string} xpath
     * @returns {Promise} Promise object represents when the element has been double clicked.
     * @throws Will throw an error if the element is not found.
     */
    byXpath(xpath: string, options: any): Promise<any>;
    /**
     * Perform mouse double click on an element matches a CSS selector.
     * @param {string} selector
     * @returns {Promise} Promise object represents when the element has been double clicked.
     * @throws Will throw an error if the element is not found.
     */
    bySelector(selector: string, options: any): Promise<any>;
    /**
     * Perform mouse double click at the cursor's position.
     * @returns {Promise} Promise object represents when double click occurs.
     * @throws Will throw an error if double click cannot be performed.
     */
    atCursor(options: any): Promise<any>;
}
//# sourceMappingURL=doubleClick.d.ts.map