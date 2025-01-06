import { getLogger } from '@sitespeed.io/log';
const log = getLogger('browsertime.command.debug');
const delay = ms => new Promise(res => setTimeout(res, ms));

/**
 * Provides debugging capabilities within a browser automation script.
 * It allows setting breakpoints to pause script execution and inspect the current state.
 *
 * @class
 * @hideconstructor
 */
export class Debug {
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
   * Adds a breakpoint to the script. The browser will pause at the breakpoint, waiting for user input to continue.
   * This is useful for debugging and inspecting the browser state at a specific point in the script.
   *
   * @example await commands.debug.breakpoint('break');
   * @async
   * @param {string} [name] - An optional name for the breakpoint for logging purposes.
   * @returns {Promise<void>} A promise that resolves when the user chooses to continue from the breakpoint.
   */
  async breakpoint(name) {
    if (this.options.debug) {
      const logMessage = `Pausing for breakpoint ${
        name || ''
      }, set browsertime.pause = false; to continue`;

      await this.browser.runScript(
        `console.log('${logMessage}');`,
        'CONSOLE_LOG'
      );
      log.info(logMessage);
      let debug = true;
      await this.browser.runScript(
        'window.browsertime = {}; window.browsertime.pause = true',
        'PAUSE_SCRIPT'
      );
      while (debug === true) {
        debug = await this.browser.runScript(
          'return window.browsertime.pause',
          'GET_PAUSE_STATUS'
        );
        await delay(1000);
      }
      log.info('Exit breakpoint and continue.');
      return this.browser.runScript(
        'window.browsertime.pause = false',
        'SET_PAUSE_STATUS'
      );
    }
  }
}
