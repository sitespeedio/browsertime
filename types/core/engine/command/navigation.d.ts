export class Navigation {
    constructor(browser: any, pageCompleteCheck: any);
    browser: any;
    pageCompleteCheck: any;
    /**
     * Navigate backward in history
     */
    back(options: any): Promise<any>;
    /**
     * Navigate forward in history
     */
    forward(options: any): Promise<any>;
    /**
     * Refresh page
     */
    refresh(options: any): Promise<any>;
}
//# sourceMappingURL=navigation.d.ts.map