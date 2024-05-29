/**
 * Manage the browser cache.
 * This class provides methods to clear the cache and cookies in different browsers.
 *
 * @class
 * @hideconstructor
 */
export class Cache {
    constructor(browser: any, browserName: any, cdp: any);
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
    private cdp;
    /**
     * Clears the browser cache. This includes both cache and cookies.
     *
     * For Chrome and Edge, it uses the Chrome DevTools Protocol (CDP) commands.
     * If the browser is not supported, logs an error message.
     *
     * @async
     * @example await commands.cache.clear();
     * @throws Will throw an error if the browser is not supported.
     * @returns {Promise<void>} A promise that resolves when the cache and cookies are cleared.
     */
    clear(): Promise<void>;
    /**
     * Clears the browser cache while keeping the cookies.
     *
     * For Chrome and Edge, it uses the Chrome DevTools Protocol (CDP) command to clear the cache.
     * If the browser is not supported, logs an error message.
     *
     * @async
     * @example await commands.cache.clearKeepCookies();
     * @throws Will throw an error if the browser is not supported.
     * @returns {Promise<void>} A promise that resolves when the cache is cleared but cookies are kept.
     */
    clearKeepCookies(): Promise<void>;
}
//# sourceMappingURL=cache.d.ts.map