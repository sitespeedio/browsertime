import { getLogger } from '@sitespeed.io/log';

const log = getLogger('browsertime.command.playwright');

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
  constructor(browser, options) {
    /**
     * @private
     */
    this.browser = browser;
    /**
     * @private
     */
    this.options = options;
    /**
     * @private
     */
    this.browserName = options.browser;
    /**
     * @private
     */
    this.pwBrowser = undefined;
  }

  /**
   * @private
   */
  async _connect() {
    if (this.browserName !== 'chrome' && this.browserName !== 'edge') {
      throw new Error(
        'commands.playwright is only supported in Chrome and Edge (CDP). Firefox is not supported.'
      );
    }
    if (this.pwBrowser) {
      return this.pwBrowser;
    }
    let playwright;
    try {
      ({ chromium: playwright } = await import('playwright-core'));
    } catch {
      throw new Error(
        "playwright-core is not installed. Run 'npm install playwright-core' to use commands.playwright."
      );
    }
    const endpoint = `http://localhost:${this.options.devToolsPort}`;
    log.debug('Connecting Playwright over CDP at %s', endpoint);
    this.pwBrowser = await playwright.connectOverCDP(endpoint);
    return this.pwBrowser;
  }

  /**
   * Get the Playwright Browser connected to the running Chrome/Edge instance.
   * @async
   * @example const pwBrowser = await commands.playwright.getBrowser();
   * @returns {Promise<import('playwright-core').Browser>} The Playwright Browser.
   */
  async getBrowser() {
    return this._connect();
  }

  /**
   * Get the first Playwright BrowserContext for the running browser.
   * @async
   * @example const ctx = await commands.playwright.getContext();
   * @returns {Promise<import('playwright-core').BrowserContext>} The default Playwright context.
   */
  async getContext() {
    const pwBrowser = await this._connect();
    const contexts = pwBrowser.contexts();
    if (contexts.length === 0) {
      throw new Error(
        'Playwright connected but found no BrowserContext on the running browser.'
      );
    }
    return contexts[0];
  }

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
  async getPage() {
    const context = await this.getContext();
    const pages = context.pages();
    if (pages.length === 0) {
      throw new Error(
        'Playwright connected but found no Page on the running browser.'
      );
    }
    let currentUrl;
    try {
      currentUrl = await this.browser.getDriver().getCurrentUrl();
    } catch {
      return pages[0];
    }
    const match = pages.find(p => p.url() === currentUrl);
    return match || pages[0];
  }

  /**
   * Disconnect Playwright without closing the underlying browser.
   * Optional — Browsertime drops the connection when the browser stops.
   * @async
   */
  async disconnect() {
    if (this.pwBrowser) {
      const pw = this.pwBrowser;
      this.pwBrowser = undefined;
      try {
        await pw.close();
      } catch (error) {
        log.debug('Playwright disconnect failed: %s', error);
      }
    }
  }
}
