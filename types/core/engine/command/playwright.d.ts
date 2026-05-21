/**
 * Bridge that exposes a Playwright handle bound to the same browser Browsertime
 * is driving via Selenium. Works for Chrome and Edge by reusing the existing
 * `--remote-debugging-port` (CDP) endpoint via `playwright.chromium.connectOverCDP()`.
 *
 * The bridge is lazy: `playwright-core` is only imported, and the connection only
 * opened, when a method is first called. The connection is reused across calls
 * within an iteration.
 *
 * Note: do NOT call `browser.close()` on the returned Playwright Browser — that
 * would close the underlying Chrome instance Browsertime owns. Use `disconnect()`
 * if you need to drop the Playwright connection early; otherwise Browsertime
 * tears it down when the browser stops.
 *
 * @class
 * @hideconstructor
 * @see https://playwright.dev/docs/api/class-browsertype#browser-type-connect-over-cdp
 */
export class Playwright {
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
     * @private
     */
    private browserName;
    /**
     * @private
     */
    private pwBrowser;
    /**
     * @private
     */
    private _connect;
    /**
     * Get the Playwright Browser connected to the running Chrome/Edge instance.
     * @async
     * @example const pwBrowser = await commands.playwright.getBrowser();
     * @returns {Promise<import('playwright-core').Browser>} The Playwright Browser.
     */
    getBrowser(): Promise<import("playwright-core").Browser>;
    /**
     * Get the first Playwright BrowserContext for the running browser.
     * @async
     * @example const ctx = await commands.playwright.getContext();
     * @returns {Promise<import('playwright-core').BrowserContext>} The default Playwright context.
     */
    getContext(): Promise<import("playwright-core").BrowserContext>;
    /**
     * Get the Playwright Page that matches the tab Selenium is currently driving.
     * Matching is done by URL; falls back to the first page in the first context
     * if no exact match is found.
     * @async
     * @example
     * await commands.measure.start('https://example.org');
     * const page = await commands.playwright.getPage();
     * await page.locator('h1').screenshot({ path: 'h1.png' });
     * @returns {Promise<import('playwright-core').Page>} The Playwright Page bound to the active tab.
     */
    getPage(): Promise<import("playwright-core").Page>;
    /**
     * Disconnect Playwright without closing the underlying browser.
     * Optional — Browsertime drops the connection when the browser stops.
     * @async
     */
    disconnect(): Promise<void>;
}
//# sourceMappingURL=playwright.d.ts.map