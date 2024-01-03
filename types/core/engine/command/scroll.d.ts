export class Scroll {
    constructor(browser: any, options: any);
    browser: any;
    options: any;
    /**
     * Scroll the page by the specified pixels.
     * @param {number} X pixels and Y pixels
     * @returns {Promise} Promise object represents when scrolling the page has been
     */
    byPixels(Xpixels: any, Ypixels: any): Promise<any>;
    /**
     * Scroll the page by the specified lines.  Only supported by Firefox.
     * @param {number} Lines
     * @returns {Promise} Promise object represents when scrolling the page has been finished.
     * @throws Will throw an error if window.scrollByLines generates an error.
     */
    byLines(lines: any): Promise<any>;
    /**
     * Scroll the page by the specified pages.
     * @param {number} Pages
     * @returns {Promise} Promise object represents when scrolling the page has been finished.
     */
    byPages(pages: any): Promise<any>;
    /**
     * Scroll to the bottom of the page. Will scroll page by page and wait the delayTime between each scroll. Default delay time is 250 ms
     * @param {number} delayTime
     * @returns {Promise} Promise object represents when scrolling the page has been finished.
     */
    toBottom(delayTime?: number): Promise<any>;
}
//# sourceMappingURL=scroll.d.ts.map