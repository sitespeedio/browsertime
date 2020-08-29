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
      throw Error(`Could not run JavaScript ${js}`);
    }
  }

  /**
   *  Run JavaScript and wait for page complete check to finish.
   * @param {string} js
   * @returns {Promise} Promise object represents when the JavaScript has been executed by the browser and the page complete check is done.
   * @throws Will throw an error if the JavsScript can't run
   */
  async runAndWait(js) {
    try {
      await this.browser.runScript(js, 'CUSTOM');
      return this.browser.extraWait(this.pageCompleteCheck);
    } catch (e) {
      log.error('Could not run JavaScript %s ', js);
      log.verbose(e);
      throw Error(`Could not run JavaScript ${js}`);
    }
  }

  /**
   * Run synchronous privileged JavaScript.
   * @param {string} js
   * @returns {Promise} Promise object represents when the JavaScript has been executed by the browser
   * @throws Will throw an error if the JavsScript can't run
   */
  async runPrivileged(js) {
    try {
      const value = await this.browser.runPrivilegedScript(
        js,
        'CUSTOM PRIVILEGED'
      );
      return value;
    } catch (e) {
      log.error('Could not run privileged JavaScript %s ', js);
      log.verbose(e);
      throw e;
    }
  }

  /**
   * Run synchronous privileged JavaScript and wait for page complete check to finish.
   * @param {string} js
   * @returns {Promise} Promise object represents when the JavaScript has been executed by the browser and the page complete check is done.
   * @throws Will throw an error if the JavsScript can't run
   */
  async runPrivilegedAndWait(js) {
    try {
      await this.browser.runPrivilegedScript(js, 'CUSTOM PRIVILEGED');
      return this.browser.extraWait(this.pageCompleteCheck);
    } catch (e) {
      log.error('Could not run privileged JavaScript %s ', js);
      log.verbose(e);
      throw e;
    }
  }

  /**
   * Run asynchronous privileged JavaScript.
   * @param {string} js
   * @returns {Promise} Promise object represents when the JavaScript has been executed by the browser
   * @throws Will throw an error if the JavsScript can't run
   */
  async runPrivilegedAsync(js) {
    try {
      const value = await this.browser.runPrivilegedAsyncScript(
        js,
        'CUSTOM ASYNC PRIVILEGED'
      );
      return value;
    } catch (e) {
      log.error('Could not run async privileged JavaScript %s ', js);
      log.verbose(e);
      throw e;
    }
  }
}
module.exports = JavaScript;
