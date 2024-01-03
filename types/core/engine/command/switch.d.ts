export class Switch {
    constructor(browser: any, pageCompleteCheck: any, navigate: any);
    browser: any;
    pageCompleteCheck: any;
    navigate: any;
    /**
     * Switch to frame by id
     * @param {*} id
     */
    toFrame(id: any): Promise<void>;
    /**
     * Switch to frame by xpath
     * @param {*} xpath
     */
    toFrameByXpath(xpath: any): Promise<void>;
    /**
     * Switch to frame by xpath
     * @param {*} xpath
     */
    toFrameBySelector(selector: any): Promise<void>;
    /**
     * Switch to a window by name
     * @param {*} name
     */
    toWindow(name: any): Promise<void>;
    /**
     * Switch to parent frame
     */
    toParentFrame(): Promise<void>;
    /**
     * Create a new tab and switch to it. Optionally, navigate to a given url.
     */
    toNewTab(url: any): Promise<void>;
    /**
     * Create a new window and switch to it. Optionally, navigate to a given url.
     */
    toNewWindow(url: any): Promise<void>;
}
//# sourceMappingURL=switch.d.ts.map