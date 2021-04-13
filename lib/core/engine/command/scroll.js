'use strict';

const log = require('intel').getLogger('browsertime.command.scroll');
class Scroll {
  constructor(browser, options) {
    this.browser = browser;
    this.options = options;
  }

  /**
   * Scroll the page by the specified pixels.
   * @param {number} X pixels and Y pixels
   * @returns {Promise} Promise object represents when scrolling the page has been finished.
   * @throws Will throw an error if window.scrollBy generates an error.
   */
  async byPixels(Xpixels, Ypixels) {
    try {
      const script = `window.scrollBy(${Xpixels}, ${Ypixels});`;
      await this.browser.runScript(script, 'CUSTOM');
    } catch (e) {
      log.error('Could not scroll by (%d,%d) pixels', Xpixels, Ypixels);
      log.verbose(e);
      throw Error('Could not scroll by (%d,%d) pixels', Xpixels, Ypixels);
    }
  }

  /**
   * Scroll the page by the specified lines.  Only supported by Firefox.
   * @param {number} Lines
   * @returns {Promise} Promise object represents when scrolling the page has been finished.
   * @throws Will throw an error if window.scrollByLines generates an error.
   */
  async byLines(lines) {
    if (this.options.browser !== 'firefox') {
      log.error(
        'scroll.byLines is only supported in Firefox. Please use scroll.byPixels instead.'
      );
      throw Error(
        'scroll.byLines is only supported in Firefox. Please use scroll.byPixels instead.'
      );
    }

    try {
      const script = `window.scrollByLines(${lines});`;
      await this.browser.runScript(script, 'CUSTOM');
    } catch (e) {
      log.error('Could not scroll by %d lines', lines);
      log.verbose(e);
      throw Error('Could not scroll by %d lines', lines);
    }
  }

  /**
   * Scroll the page by the specified pages. Only supported by Firefox.
   * @param {number} Pages
   * @returns {Promise} Promise object represents when scrolling the page has been finished.
   * @throws Will throw an error if window.scrollByPages generates an error.
   */
  async byPages(pages) {
    if (this.options.browser !== 'firefox') {
      log.error(
        'scroll.byPages is only supported in Firefox. Please use scroll.byPixels instead.'
      );
      throw Error(
        'scroll.byPages is only supported in Firefox. Please use scroll.byPixels instead.'
      );
    }

    try {
      const script = `window.scrollByPages(${pages});`;
      await this.browser.runScript(script, 'CUSTOM');
    } catch (e) {
      log.error('Could not scroll by %d pages', pages);
      log.verbose(e);
      throw Error('Could not scroll by %d pages', pages);
    }
  }
}
module.exports = Scroll;
