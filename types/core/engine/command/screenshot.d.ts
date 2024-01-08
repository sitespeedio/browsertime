/**
 * Take a screenshot. The screenshot will be stored to disk,
 * named by the name provided to the take function.
 *
 * @class
 * @hideconstructor
 */
export class Screenshot {
    constructor(screenshotManager: any, browser: any, index: any);
    /**
     * @private
     */
    private screenshotManager;
    /**
     * @private
     */
    private browser;
    /**
     * @private
     */
    private index;
    /**
     * Takes a screenshot and saves it using the screenshot manager.
     *
     * @async
     * @example async commands.screenshot.take('my_startpage');
     * @param {string} name The name to assign to the screenshot file.
     * @throws {Error} Throws an error if the name parameter is not provided.
     * @returns {Promise<Object>} A promise that resolves with the screenshot details.
     */
    take(name: string): Promise<any>;
}
//# sourceMappingURL=screenshot.d.ts.map