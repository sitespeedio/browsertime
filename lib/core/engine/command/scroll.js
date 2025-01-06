import { getLogger } from '@sitespeed.io/log';
const log = getLogger('browsertime.command.scroll');
const delay = ms => new Promise(res => setTimeout(res, ms));

/**
 * Provides functionality to control page scrolling in the browser.
 *
 * @class
 * @hideconstructor
 */
export class Scroll {
  constructor(browser, options) {
    /**
     * @private
     */
    this.browser = browser;
    /**
     * @private
     */
    this.options = options;
  }

  /**
   * Scrolls the page by the specified number of pixels.
   *
   * @async
   * @param {number} Xpixels - The number of pixels to scroll horizontally.
   * @param {number} Ypixels - The number of pixels to scroll vertically.
   * @returns {Promise<void>} A promise that resolves when the scrolling action is completed.
   */
  async byPixels(Xpixels, Ypixels) {
    const script = `window.scrollBy(${Xpixels}, ${Ypixels});`;
    return this.browser.runScript(script, 'scroll-by-pixel');
  }

  /**
   * Scrolls the page by the specified number of lines. This method is only supported in Firefox.
   *
   * @async
   * @param {number} lines - The number of lines to scroll.
   * @returns {Promise<void>} A promise that resolves when the scrolling action is completed.
   * @throws {Error} Throws an error if not used in Firefox.
   */
  async byLines(lines) {
    if (this.options.browser !== 'firefox') {
      log.error(
        'scroll.byLines is only supported in Firefox. Please use scroll.byPixels instead.'
      );
      throw new Error(
        'scroll.byLines is only supported in Firefox. Please use scroll.byPixels instead.'
      );
    }

    const script = `window.scrollByLines(${lines});`;
    return this.browser.runScript(script, 'scroll-by-lines');
  }

  /**
   * Scrolls the page by the specified number of pages.
   *
   * @async
   * @param {number} pages - The number of pages to scroll.
   * @returns {Promise<void>} A promise that resolves when the scrolling action is completed.
   */
  async byPages(pages) {
    if (this.options.browser === 'firefox') {
      const script = `window.scrollByPages(${pages});`;
      return this.browser.runScript(script, 'scroll-by-pages');
    } else {
      await this.browser.runScript(
        `window.scrollBy(0, window.innerHeight * ${pages});`,
        'scroll-by'
      );
    }
  }

  /**
   * Scrolls to the bottom of the page, scrolling page by page with a delay between each scroll.
   *
   * @async
   * @param {number} [delayTime=250] - The delay time in milliseconds between each scroll.
   * @returns {Promise<void>} A promise that resolves when the scrolling to the bottom is completed.
   */
  async toBottom(delayTime = 250) {
    const pages = await this.browser.runScript(
      'return document.body.scrollHeight / window.innerHeight;',
      'get-pages'
    );

    for (let page = 0; page < pages; page++) {
      await this.browser.runScript(
        'window.scrollBy(0, window.innerHeight);',
        'scroll-by'
      );
      await delay(delayTime);
    }
  }
}
