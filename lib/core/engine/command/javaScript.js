'use strict';

const log = require('intel').getLogger('browsertime.command.javascript');

class JavaScript {
  constructor(browser) {
    this.browser = browser;
  }

  /**
   *  Run JavaScript.
   * @param {string} js
   * @returns {Promise} Promise object represents when the JavaScript has been executed by the browser
   * @throws Will throw an error if the JavsScript can't run
   */
  async run(js) {
    try {
      await this.browser.runScript(js, 'CUSTOM');
    } catch (e) {
      log.error('Could not run JavaScript %s ', js);
      log.verbose(e);
      throw e;
    }
  }

  /**
   * Run async JavaScript.
   * @param {string} js
   * @returns {Promise} Promise object represents when the async JavaScript has been executed and solved by the browser.
   * @throws Will throw an error if the JavaScript can't run
   */
  async runAsync(js) {
    try {
      await this.browser.runAsyncScrip(js, 'CUSTOM_ASYNC');
    } catch (e) {
      log.error('Could not run async JavaScript %s ', js);
      log.verbose(e);
      throw e;
    }
  }
}
module.exports = JavaScript;
