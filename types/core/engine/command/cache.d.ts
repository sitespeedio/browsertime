export class Cache {
    constructor(browser: any, browserName: any, extensionServer: any, cdp: any);
    browser: any;
    browserName: any;
    extensionServer: any;
    cdp: any;
    /**
     * Clear the browser cache. Will clear browser cache and cookies.
     */
    clear(): Promise<any>;
    /**
     * Clear the browser cache but keep cookies.
     */
    clearKeepCookies(): Promise<any>;
}
//# sourceMappingURL=cache.d.ts.map