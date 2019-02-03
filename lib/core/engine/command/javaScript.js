'use strict';

const log = require('intel').getLogger('browsertime.command.javascript');
class JavaScript {
  constructor(browser, pageCompleteCheck) {
    this.browser = browser;
    this.pageCompleteCheck = pageCompleteCheck;
  }

  /**
   *  Run JavaScript.
   * @param {string} js
   * @returns {Promise} Promise object represents when the JavaScript has been executed by the browser
   * @throws Will throw an error if the JavsScript can't run
   */
  async run(js) {
    try {
      const value = await this.browser.runScript(js, 'CUSTOM');
      return value;
    } catch (e) {
      log.error('Could not run JavaScript %s ', js);
      log.verbose(e);
      throw e;
    }
  }

  /**
   *  Run JavaScript and wait for page complete check to finish.
   * @param {string} js
   * @returns {Promise} Promise object represents when the JavaScript has been executed by the browser
   * @throws Will throw an error if the JavsScript can't run
   */
  async runAndWait(js) {
    try {
      await this.browser.runScript(js, 'CUSTOM');
      return this.browser.extraWait(this.pageCompleteCheck);
    } catch (e) {
      log.error('Could not run JavaScript %s ', js);
      log.verbose(e);
      throw e;
    }
  }
}
module.exports = JavaScript;
