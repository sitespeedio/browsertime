export class Cache {
    constructor(browser: any, browserName: any, extensionServer: any, cdp: any);
    /**
     * @private
     */
    private browser;
    /**
     * @private
     */
    private browserName;
    /**
     * @private
     */
    private extensionServer;
    /**
     * @private
     */
    private cdp;
    /**
     * Clears the browser cache. This includes both cache and cookies.
     *
     * For Firefox, it uses the extensionServer setup with specific options.
     * For Chrome and Edge, it uses the Chrome DevTools Protocol (CDP) commands.
     * If the browser is not supported, logs an error message.
     *
     * @async
     * @throws Will throw an error if the browser is not supported.
     * @returns {Promise<void>} A promise that resolves when the cache and cookies are cleared.
     */
    clear(): Promise<void>;
    /**
     * Clears the browser cache while keeping the cookies.
     *
     * For Firefox, it uses the extensionServer setup with specific options.
     * For Chrome and Edge, it uses the Chrome DevTools Protocol (CDP) command to clear the cache.
     * If the browser is not supported, logs an error message.
     *
     * @async
     * @throws Will throw an error if the browser is not supported.
     * @returns {Promise<void>} A promise that resolves when the cache is cleared but cookies are kept.
     */
    clearKeepCookies(): Promise<void>;
}
//# sourceMappingURL=cache.d.ts.map