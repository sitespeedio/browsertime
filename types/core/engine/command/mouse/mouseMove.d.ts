export class MouseMove {
    constructor(browser: any);
    driver: any;
    actions: any;
    /**
     * Move mouse to an element that matches a XPath selector.
     * @param {string} xpath
     * @returns {Promise} Promise object represents when the mouse has moved
     * @throws Will throw an error if the element is not found
     */
    byXpath(xpath: string): Promise<any>;
    /**
     * Move mouse to an element that matches a CSS selector.
     * @param {string} selector
     * @returns {Promise} Promise object represents when the mouse has moved
     * @throws Will throw an error if the element is not found
     */
    bySelector(selector: string): Promise<any>;
    /**
     * Move mouse to a position
     * @param {number} xPos, {number} yPos
     * @returns {Promise} Promise object represents when the mouse has moved
     * @throws Will throw an error if the element is not found
     */
    toPosition(xPos: number, yPos: any): Promise<any>;
    /**
     * Move mouse by an offset
     * @param {number} xOffset, {number} yOffset
     * @returns {Promise} Promise object represents when the mouse has moved
     * @throws Will throw an error if the element is not found
     */
    byOffset(xOffset: number, yOffset: any): Promise<any>;
}
//# sourceMappingURL=mouseMove.d.ts.map