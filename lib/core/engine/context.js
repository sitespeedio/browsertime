/**
 * @typedef {Object} Logger
 * @property {function(string): void} trace - Function to log trace messages.
 * @property {function(string): void} verbose - Function to log verbose messages.
 * @property {function(string): void} info - Function to log info messages.
 * @property {function(string): void} warn - Function to log warning messages.
 * @property {function(string): void} error - Function to log error messages.
 * @property {function(string): void} critical - Function to log critical messages.
 */

/**
 * @typedef {typeof import('selenium-webdriver')} WebDriverClass
 * @typedef {import('selenium-webdriver').WebDriver} WebDriverInstance
 */

/**
 * Class representing the context of a Browsertime run.
 * @hideconstructor
 * @class
 */
export class Context {
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
     * This is the yargs object you get from the cli. If you add --my.id you can get that using options.my.id.
     * @type {Record<string, any>}
     */
    this.options = options;

    /**
     * Here the result from each run is stored.
     * @type {Record<string, any>}
     */
    this.result = result;

    /**
     * @type {Logger}
     */
    this.log = log;

    /**
     * The index of the iteration.
     * @type {number}
     */
    this.index = index;

    /**
     * Storage manager to save things to disk.
     * @type {import('../../support/storageManager.js').StorageManager}
     */
    this.storageManager = storageManager;

    /**
     * Scratch space shared between commands within a single iteration.
     * @type {Record<string, any>}
     */
    this.taskData = {};

    /**
     * Get raw Selenium functionality.
     * @see https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/index.html
     * @type {{webdriver: WebDriverClass, driver: WebDriverInstance}}
     */
    this.selenium = {
      webdriver,
      driver: instantiatedDriver
    };
  }
}
