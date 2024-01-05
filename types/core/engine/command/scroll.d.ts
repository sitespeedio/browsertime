/**
 * Provides functionality to control page scrolling in the browser.
 *
 * @class
 * @hideconstructor
 */
export class Scroll {
    constructor(browser: any, options: any);
    /**
     * @private
     */
    private browser;
    /**
     * @private
     */
    private options;
    /**
     * Scrolls the page by the specified number of pixels.
     *
     * @async
     * @param {number} Xpixels - The number of pixels to scroll horizontally.
     * @param {number} Ypixels - The number of pixels to scroll vertically.
     * @returns {Promise<void>} A promise that resolves when the scrolling action is completed.
     */
    byPixels(Xpixels: number, Ypixels: number): Promise<void>;
    /**
     * Scrolls the page by the specified number of lines. This method is only supported in Firefox.
     *
     * @async
     * @param {number} lines - The number of lines to scroll.
     * @returns {Promise<void>} A promise that resolves when the scrolling action is completed.
     * @throws {Error} Throws an error if not used in Firefox.
     */
    byLines(lines: number): Promise<void>;
    /**
     * Scrolls the page by the specified number of pages.
     *
     * @async
     * @param {number} pages - The number of pages to scroll.
     * @returns {Promise<void>} A promise that resolves when the scrolling action is completed.
     */
    byPages(pages: number): Promise<void>;
    /**
     * Scrolls to the bottom of the page, scrolling page by page with a delay between each scroll.
     *
     * @async
     * @param {number} [delayTime=250] - The delay time in milliseconds between each scroll.
     * @returns {Promise<void>} A promise that resolves when the scrolling to the bottom is completed.
     */
    toBottom(delayTime?: number): Promise<void>;
}
//# sourceMappingURL=scroll.d.ts.map