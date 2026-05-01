/**
 * Handles screenshot capture during measurement collection.
 * @class
 * @private
 */
export class MeasureScreenshots {
    constructor(browser: any, screenshotManager: any, options: any);
    browser: any;
    screenshotManager: any;
    options: any;
    afterPageCompleteCheck(url: any, index: any): Promise<void>;
    layoutShift(url: any, index: any): Promise<void>;
    largestContentfulPaint(url: any, index: any): Promise<void>;
}
//# sourceMappingURL=screenshots.d.ts.map