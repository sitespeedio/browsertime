'use strict';

const log = require('intel').getLogger('browsertime.command.scroll');

const delay = ms => new Promise(res => setTimeout(res, ms));
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
      return this.browser.runScript(script, 'CUSTOM');
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
      return this.browser.runScript(script, 'CUSTOM');
    } catch (e) {
      log.error('Could not scroll by %d lines', lines);
      log.verbose(e);
      throw Error('Could not scroll by %d lines', lines);
    }
  }

  /**
   * Scroll the page by the specified pages.
   * @param {number} Pages
   * @returns {Promise} Promise object represents when scrolling the page has been finished.
   * @throws Will throw an error if window.scrollByPages generates an error.
   */
  async byPages(pages) {
    try {
      if (this.options.browser === 'firefox') {
        const script = `window.scrollByPages(${pages});`;
        return this.browser.runScript(script, 'CUSTOM');
      } else {
        await this.browser.runScript(
          `window.scrollBy(0, window.innerHeight * ${pages});`
        );
      }
    } catch (e) {
      log.error('Could not scroll by %d pages', pages);
      log.verbose(e);
      throw Error('Could not scroll by %d pages', pages);
    }
  }

  /**
   * Scroll to the bottom of the page. Will scroll page by page and wait the delayTime between each scroll. Default delay time is 250 ms
   * @param {number} delayTime
   * @returns {Promise} Promise object represents when scrolling the page has been finished.
   */
  async toBottom(delayTime = 250) {
    const pages = await this.browser.runScript(
      'return document.body.scrollHeight / window.innerHeight;'
    );

    for (let page = 0; page < pages; page++) {
      await this.browser.runScript('window.scrollBy(0, window.innerHeight);');
      await delay(delayTime);
    }
  }
}
module.exports = Scroll;
