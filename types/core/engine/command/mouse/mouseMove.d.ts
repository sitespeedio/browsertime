/**
 * Provides functionality to move the mouse cursor to elements or specific positions on a web page.
 *
 * @class
 * @hideconstructor
 */
export class MouseMove {
    constructor(browser: any);
    /**
     * @private
     */
    private driver;
    /**
     * @private
     */
    private actions;
    /**
     * Moves the mouse cursor to an element that matches a given XPath selector.
     *
     * @async
     * @param {string} xpath - The XPath selector of the element to move to.
     * @returns {Promise<void>} A promise that resolves when the mouse has moved to the element.
     * @throws {Error} Throws an error if the element is not found.
     */
    byXpath(xpath: string): Promise<void>;
    /**
     * Moves the mouse cursor to an element that matches a given CSS selector.
     *
     * @async
     * @param {string} selector - The CSS selector of the element to move to.
     * @returns {Promise<void>} A promise that resolves when the mouse has moved to the element.
     * @throws {Error} Throws an error if the element is not found.
     */
    bySelector(selector: string): Promise<void>;
    /**
     * Moves the mouse cursor to a specific position on the screen.
     *
     * @async
     * @param {number} xPos - The x-coordinate on the screen to move to.
     * @param {number} yPos - The y-coordinate on the screen to move to.
     * @returns {Promise<void>} A promise that resolves when the mouse has moved to the specified position.
     * @throws {Error} Throws an error if the action cannot be performed.
     */
    toPosition(xPos: number, yPos: number): Promise<void>;
    /**
     * Moves the mouse cursor by an offset from its current position.
     *
     * @async
     * @param {number} xOffset - The x offset to move by.
     * @param {number} yOffset - The y offset to move by.
     * @returns {Promise<void>} A promise that resolves when the mouse has moved by the specified offset.
     * @throws {Error} Throws an error if the action cannot be performed.
     */
    byOffset(xOffset: number, yOffset: number): Promise<void>;
}
//# sourceMappingURL=mouseMove.d.ts.map