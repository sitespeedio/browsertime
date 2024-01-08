/**
 * Provides functionality to click and hold elements on a web page using different strategies.
 *
 * @class
 * @hideconstructor
 */
export class ClickAndHold {
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
     * Clicks and holds on an element that matches a given XPath selector.
     *
     * @async
     * @param {string} xpath - The XPath selector of the element to interact with.
     * @returns {Promise<void>} A promise that resolves when the action is performed.
     * @throws {Error} Throws an error if the element is not found.
     */
    byXpath(xpath: string): Promise<void>;
    /**
     * Clicks and holds on an element that matches a given CSS selector.
     *
     * @async
     * @param {string} selector - The CSS selector of the element to interact with.
     * @returns {Promise<void>} A promise that resolves when the action is performed.
     * @throws {Error} Throws an error if the element is not found.
     */
    bySelector(selector: string): Promise<void>;
    /**
     * Clicks and holds at the current cursor position.
     *
     * @async
     * @returns {Promise<void>} A promise that resolves when the action is performed.
     * @throws {Error} Throws an error if the action cannot be performed.
     */
    atCursor(): Promise<void>;
    /**
     * Clicks and holds at the specified screen coordinates.
     *
     * @async
     * @param {number} xPos - The x-coordinate on the screen.
     * @param {number} yPos - The y-coordinate on the screen.
     * @returns {Promise<void>} A promise that resolves when the action is performed.
     * @throws {Error} Throws an error if the action cannot be performed.
     */
    atPosition(xPos: number, yPos: number): Promise<void>;
    /**
     * Releases the mouse button on an element matching the specified XPath.
     *
     * @async
     * @param {string} xpath - The XPath selector of the element to release the mouse on.
     * @returns {Promise<void>} A promise that resolves when the action is performed.
     * @throws {Error} Throws an error if the action cannot be performed.
     */
    releaseAtXpath(xpath: string): Promise<void>;
    /**
     * Releases the mouse button on an element matching the specified CSS selector.
     *
     * @async
     * @param {string} selector - The CSS selector of the element to release the mouse on.
     * @returns {Promise<void>} A promise that resolves when the action is performed.
     * @throws {Error} Throws an error if the action cannot be performed.
     */
    releaseAtSelector(selector: string): Promise<void>;
    /**
     * Releases the mouse button at the specified screen coordinates.
     *
     * @async
     * @param {number} xPos - The x-coordinate on the screen.
     * @param {number} yPos - The y-coordinate on the screen.
     * @returns {Promise<void>} A promise that resolves when the action is performed.
     * @throws {Error} Throws an error if the action cannot be performed.
     */
    releaseAtPosition(xPos: number, yPos: number): Promise<void>;
}
//# sourceMappingURL=clickAndHold.d.ts.map