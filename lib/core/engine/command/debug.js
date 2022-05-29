'use strict';

const log = require('intel').getLogger('browsertime.command.debug');
const delay = ms => new Promise(res => setTimeout(res, ms));

class Debug {
  constructor(browser, options) {
    this.browser = browser;
    this.options = options;
  }

  /**
   *
   * @returns {Promise} Promise object represents when the pageCompleteCheck has finished.
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
      log.debug(logMessage);
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
      await this.browser.runScript(
        'window.browsertime.palse = false',
        'SET_PAUSE_STATUS'
      );
    }
  }
}

module.exports = Debug;
