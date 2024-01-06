/**
 * Provides functionality to switch between frames, windows, and tabs in the browser.
 *
 * @class
 * @hideconstructor
 */
export class Switch {
    constructor(browser: any, pageCompleteCheck: any, navigate: any);
    /**
     * @private
     */
    private browser;
    /**
     * @private
     */
    private pageCompleteCheck;
    /**
     * @private
     */
    private navigate;
    /**
     * Switches to a frame identified by its ID.
     *
     * @async
     * @param {string|number} id - The ID of the frame.
     * @throws {Error} Throws an error if switching to the frame fails.
     */
    toFrame(id: string | number): Promise<void>;
    /**
     * Switches to a frame identified by an XPath.
     *
     * @async
     * @param {string} xpath - The XPath of the frame element.
     * @throws {Error} Throws an error if the frame is not found or switching fails.
     */
    toFrameByXpath(xpath: string): Promise<void>;
    /**
     * Switches to a frame identified by a CSS selector.
     *
     * @async
     * @param {string} selector - The CSS selector of the frame element.
     * @throws {Error} Throws an error if the frame is not found or switching fails.
     */
    toFrameBySelector(selector: string): Promise<void>;
    /**
     * Switches to a window identified by its name.
     *
     * @async
     * @param {string} name - The name of the window.
     * @throws {Error} Throws an error if switching to the window fails.
     */
    toWindow(name: string): Promise<void>;
    /**
     * Switches to the parent frame of the current frame.
     *
     * @async
     * @throws {Error} Throws an error if switching to the parent frame fails.
     */
    toParentFrame(): Promise<void>;
    /**
     * Opens a new tab and optionally navigates to a URL.
     *
     * @async
     * @param {string} [url] - Optional URL to navigate to in the new tab.
     * @throws {Error} Throws an error if opening a new tab fails.
     */
    toNewTab(url?: string): Promise<void>;
    /**
     * Opens a new window and optionally navigates to a URL.
     *
     * @async
     * @param {string} [url] - Optional URL to navigate to in the new window.
     * @throws {Error} Throws an error if opening a new window fails.
     */
    toNewWindow(url?: string): Promise<void>;
}
//# sourceMappingURL=switch.d.ts.map