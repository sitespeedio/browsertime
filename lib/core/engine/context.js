/**
 * Class representing the context of a Browsertime run.
 *
 * @class
 */
export class Context {
  /**
   * Creates an instance of Context.
   *
   * @param {Object} options - Configuration options for the Browsertime run.
   * @param {Object} result - Object to store the results of the Browsertime run.
   * @param {intel.Logger} log - Logger for recording events or errors.
   * @param {import('../../support/storageManager.js').StorageManager} storageManager - Manages storage for the Browsertime run.
   * @param {number} index - Index representing the current iteration or run.
   * @param {import('selenium-webdriver').WebDriver} webdriver - WebDriver instance from Selenium for browser automation.
   * @param {import('selenium-webdriver').WebDriver} instantiatedDriver - WebDriver instance returned by Selenium's `builder.build()`.
   */
  constructor(
    options,
    result,
    log,
    storageManager,
    index,
    webdriver,
    instantiatedDriver
  ) {
    /**
     * @type {Object}
     */
    this.options = options;

    /**
     * @type {Object}
     */
    this.result = result;

    /**
     * @type {intel.Logger}
     */
    this.log = log;

    /**
     * @type {number}
     */
    this.index = index;

    /**
     * @type {import('../../support/storageManager.js').StorageManager}
     */
    this.storageManager = storageManager;

    /**
     * @type {Object}
     */
    this.taskData = {};

    /**
     * @type {{webdriver: import('selenium-webdriver').WebDriver, driver: import('selenium-webdriver').WebDriver}}
     */
    this.selenium = {
      webdriver,
      driver: instantiatedDriver
    };
  }
}
