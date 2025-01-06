import { getLogger } from '@sitespeed.io/log';
const log = getLogger('browsertime.command.screenshot');

/**
 * Take a screenshot. The screenshot will be stored to disk,
 * named by the name provided to the take function.
 *
 * @class
 * @hideconstructor
 */
export class Screenshot {
  constructor(screenshotManager, browser, index) {
    /**
     * @private
     */
    this.screenshotManager = screenshotManager;
    /**
     * @private
     */
    this.browser = browser;
    /**
     * @private
     */
    this.index = index;
  }

  /**
   * Takes a screenshot and saves it using the screenshot manager.
   *
   * @async
   * @example async commands.screenshot.take('my_startpage');
   * @param {string} name The name to assign to the screenshot file.
   * @throws {Error} Throws an error if the name parameter is not provided.
   * @returns {Promise<Object>} A promise that resolves with the screenshot details.
   */

  async take(name) {
    if (!name) {
      log.error('Missing name for the screenshot');
      throw new Error(`Could not store screenshot for missing name`);
    }
    const url = await this.browser
      .getDriver()
      .executeScript('return document.documentURI;');
    const screenshot = await this.browser.takeScreenshot();
    return this.screenshotManager.save(name, screenshot, url, this.index);
  }
}
