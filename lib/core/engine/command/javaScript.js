import { getLogger } from '@sitespeed.io/log';
const log = getLogger('browsertime.command.javascript');
/**
 * Provides functionality to execute JavaScript code in the context of the current page.
 *
 * @class
 * @hideconstructor
 */

export class JavaScript {
  constructor(browser, pageCompleteCheck) {
    /**
     * @private
     */
    this.browser = browser;
    /**
     * @private
     */
    this.pageCompleteCheck = pageCompleteCheck;
  }

  /**
   * Executes a JavaScript script.
   *
   * @async
   * @param {string} js - The JavaScript code to execute.
   * @returns {Promise<*>} A promise that resolves with the result of the executed script.
   * @throws {Error} Throws an error if the JavaScript cannot be executed.
   */
  async run(js) {
    try {
      const value = await this.browser.runScript(js, 'CUSTOM');
      return value;
    } catch (error) {
      log.error('Could not run JavaScript %s ', js);
      log.verbose(error);
      throw new Error(`Could not run JavaScript ${js}`);
    }
  }

  /**
   * Executes a JavaScript script and waits for the page complete check to finish.
   *
   * @async
   * @param {string} js - The JavaScript code to execute.
   * @returns {Promise<*>} A promise that resolves with the result of the executed script and the completion of the page load.
   * @throws {Error} Throws an error if the JavaScript cannot be executed.
   */
  async runAndWait(js) {
    try {
      await this.browser.runScript(js, 'CUSTOM');
      return this.browser.extraWait(this.pageCompleteCheck);
    } catch (error) {
      log.error('Could not run JavaScript %s ', js);
      log.verbose(error);
      throw new Error(`Could not run JavaScript ${js}`);
    }
  }

  /**
   * Executes synchronous privileged JavaScript.
   *
   * @async
   * @param {string} js - The privileged JavaScript code to execute.
   * @returns {Promise<*>} A promise that resolves with the result of the executed privileged script.
   * @throws {Error} Throws an error if the privileged JavaScript cannot be executed.
   */
  async runPrivileged(js) {
    try {
      const value = await this.browser.runPrivilegedScript(
        js,
        'CUSTOM PRIVILEGED'
      );
      return value;
    } catch (error) {
      log.error('Could not run privileged JavaScript %s ', js);
      log.verbose(error);
      throw error;
    }
  }

  /**
   * Executes synchronous privileged JavaScript and waits for the page complete check to finish.
   *
   * @async
   * @param {string} js - The privileged JavaScript code to execute.
   * @returns {Promise<*>} A promise that resolves with the result of the executed privileged script and the completion of the page load.
   * @throws {Error} Throws an error if the privileged JavaScript cannot be executed.
   */
  async runPrivilegedAndWait(js) {
    try {
      await this.browser.runPrivilegedScript(js, 'CUSTOM PRIVILEGED');
      return this.browser.extraWait(this.pageCompleteCheck);
    } catch (error) {
      log.error('Could not run privileged JavaScript %s ', js);
      log.verbose(error);
      throw error;
    }
  }

  /**
   * Executes asynchronous privileged JavaScript.
   *
   * @async
   * @param {string} js - The asynchronous privileged JavaScript code to execute.
   * @returns {Promise<*>} A promise that resolves with the result of the executed asynchronous privileged script.
   * @throws {Error} Throws an error if the asynchronous privileged JavaScript cannot be executed.
   */
  async runPrivilegedAsync(js) {
    try {
      const value = await this.browser.runPrivilegedAsyncScript(
        js,
        'CUSTOM ASYNC PRIVILEGED'
      );
      return value;
    } catch (error) {
      log.error('Could not run async privileged JavaScript %s ', js);
      log.verbose(error);
      throw error;
    }
  }
}
