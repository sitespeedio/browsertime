export class ClickAndHold {
    constructor(browser: any);
    driver: any;
    actions: any;
    /**
     * Click and hold an element that matches a XPath selector.
     * @param {string} xpath
     * @returns {Promise} Promise object represents when mouse is pressed.
     * @throws Will throw an error if the element is not found.
     */
    byXpath(xpath: string): Promise<any>;
    /**
     * Click and hold an element that matches a CSS selector.
     * @param {string} selector
     * @returns {Promise} Promise object represents when mouse is pressed.
     * @throws Will throw an error if the element is not found.
     */
    bySelector(selector: string): Promise<any>;
    /**
     * Click and hold an element at the cursor's position.
     * @returns {Promise} Promise object represents when mouse is pressed.
     * @throws Will throw an error if action cannot be performed.
     */
    atCursor(): Promise<any>;
    /**
     * Click and hold an element at the given coordinates.
     * @param {integer} xPos
     * @param {integer} yPos
     * @returns {Promise} Promise object represents when mouse is pressed.
     * @throws Will throw an error if action cannot be performed.
     */
    atPosition(xPos: integer, yPos: integer): Promise<any>;
    /**
     * Release mouse on element that matches the specified Xpath.
     * @param {string} xpath
     * @returns {Promise} Promise object represents when mouse is released.
     * @throws Will throw an error if action cannot be performed.
     */
    releaseAtXpath(xpath: string): Promise<any>;
    /**
     * Release mouse on element that matches the specified CSS selector.
     * @param {string} selector
     * @returns {Promise} Promise object represents when mouse is released.
     * @throws Will throw an error if action cannot be performed.
     */
    releaseAtSelector(selector: string): Promise<any>;
    /**
     * Release mouse at specified coordinates.
     * @param {integer} xPos
     * @param {integer} yPos
     * @returns {Promise} Promise object represents when mouse is released.
     * @throws Will throw an error if action cannot be performed.
     */
    releaseAtPosition(xPos: integer, yPos: integer): Promise<any>;
}
//# sourceMappingURL=clickAndHold.d.ts.map