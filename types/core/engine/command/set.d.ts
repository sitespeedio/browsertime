export class Set {
    constructor(browser: any);
    browser: any;
    /**
     * Set innerHtml to an element using a specific CSS selector.
     * @param {string} html The html string that you want to set
     * @param {string} selector The selector of the element
     * @returns {Promise} Promise object represents when the html has been
     * set to the element
     * @throws Will throw an error if the element is not found
     */
    innerHtml(html: string, selector: string): Promise<any>;
    /**
     * Set innerHtml to an element using a id
     * @param {string} html The html string that you want to set
     * @param {string} id The id of the element
     * @returns {Promise} Promise object represents when the html has been
     * set to the element
     * @throws Will throw an error if the element is not found
     */
    innerHtmlById(html: string, id: string): Promise<any>;
    /**
     * Set innerText to an element using a specific CSS selector.
     * @param {string} html The html string that you want to set
     * @param {string} selector The selector of the element
     * @returns {Promise} Promise object represents when the text has been
     * set to the element
     * @throws Will throw an error if the element is not found
     */
    innerText(text: any, selector: string): Promise<any>;
    /**
     * Set innerText to an element using a id.
     * @param {string} html The html string that you want to set
     * @param {string} id The id of the element
     * @returns {Promise} Promise object represents when the text has been
     * set to the element
     * @throws Will throw an error if the element is not found
     */
    innerTextById(text: any, id: string): Promise<any>;
    /**
     * Set value to an element using a specific CSS selector.
     * @param {string} value The value that you want to set
     * @param {string} selector The selector of the element
     * @returns {Promise} Promise object represents when the value has been
     * added to element
     * @throws Will throw an error if the element is not found
     */
    value(value: string, selector: string): Promise<any>;
    /**
     * Set value to an element using a id.
     * @param {string} value The value that you want to set
     * @param {string} selector The selector of the element
     * @returns {Promise} Promise object represents when the value has been
     * added to element
     * @throws Will throw an error if the element is not found
     */
    valueById(value: string, id: any): Promise<any>;
}
//# sourceMappingURL=set.d.ts.map