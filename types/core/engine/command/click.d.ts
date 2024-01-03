export class Click {
    constructor(browser: any, pageCompleteCheck: any);
    browser: any;
    pageCompleteCheck: any;
    /**
     * Click on element that is found by specific class name.
     * https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementsByClassName
     * ;
     * @param {string} className
     * @returns {Promise} Promise object represents when the element has been clicked
     * @throws Will throw an error if the element is not found
     */
    byClassName(className: string): Promise<any>;
    /**
     * Click on element that is found by specific class name and wait for page load complete check to finish.
     * @param {string} className
     * @returns {Promise} Promise object represents when the element has been clicked and the pageCompleteCheck has finisshed.
     * @throws Will throw an error if the element is not found
     */
    byClassNameAndWait(className: string): Promise<any>;
    /**
     * Click on link whose visible text matches the given string.
     * @param {string} text
     * @returns {Promise} Promise object represents when the element has been clicked
     * @throws Will throw an error if the element is not found
     */
    byLinkText(text: string): Promise<any>;
    /**
     * Click on link whose visible text matches the given string and wait for pageCompleteCheck to finish.
     * @param {string} text
     * @returns {Promise} Promise object represents when the element has been clicked and the pageCompleteCheck has finished.
     * @throws Will throw an error if the element is not found
     */
    byLinkTextAndWait(text: string): Promise<any>;
    /**
     * Click on link whose visible text contains the given substring.
     * @param {string} text
     * @returns {Promise} Promise object represents when the element has been clicked
     * @throws Will throw an error if the element is not found
     */
    byPartialLinkText(text: string): Promise<any>;
    /**
     * Click on link whose visible text contains the given substring and wait for pageCompleteCheck to finish.
     * @param {string} text
     * @returns {Promise} Promise object represents when the element has been clicked and the pageCompleteCheck has finished.
     * @throws Will throw an error if the element is not found
     */
    byPartialLinkTextAndWait(text: string): Promise<any>;
    /**
     * Click on link that matches a XPath selector.
     * @param {string} xpath
     * @returns {Promise} Promise object represents when the element has been clicked
     * @throws Will throw an error if the element is not found
     */
    byXpath(xpath: string): Promise<any>;
    /**.
     * Click on link that matches a XPath selector and wait for page load complete check to finish
     *
     * @param {string} xpath
     * @returns {Promise} Promise object represents when the element has been clicked and the pageCompleteCheck has finished.
     * @throws Will throw an error if the element is not found
     */
    byXpathAndWait(xpath: string): Promise<any>;
    /**
     * Click on a link located by evaluating a JavaScript expression. The result of this expression must be an element or list of elements.
     *  @param {string} js
     * @returns {Promise} Promise object represents when the element has been clicked
     * @throws Will throw an error if the element is not found
     */
    byJs(js: string): Promise<any>;
    /**
     * Click on a link located by evaluating a JavaScript expression. The result of this expression must be an element or list of elements. And wait for page complete check to finish.
     *  @param {string} js
     * @returns {Promise} Promise object represents when the element has been clicked and the pageCompleteCheck has finished.
     * @throws Will throw an error if the element is not found
     */
    byJsAndWait(js: string): Promise<any>;
    /**
     * Click on link located by the ID attribute. Uses document.getElementById().
     * @param {string} id
     * @returns {Promise} Promise object represents when the element has been clicked
     * @throws Will throw an error if the element is not found
     */
    byId(id: string): Promise<any>;
    /**
     * Click on element located by the name, Uses document.querySelector.
     * @param {string} name the name of the element
     * @returns {Promise} Promise object represents when the element has been clicked
     * @throws Will throw an error if the element is not found
     */
    byName(name: string): Promise<any>;
    /**
     * Click on link located by the ID attribute. Uses document.getElementById() to find the element. And wait for page complete check to finish.
     * @param {string} id
     * @returns {Promise} Promise object represents when the element has been clicked and the pageCompleteCheck has finished.
     * @throws Will throw an error if the element is not found
     */
    byIdAndWait(id: string): Promise<any>;
    bySelector(selector: any): Promise<void>;
    bySelectorAndWait(selector: any): Promise<any>;
}
//# sourceMappingURL=click.d.ts.map