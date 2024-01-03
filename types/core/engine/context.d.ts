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
    constructor(options: any, result: any, log: intel.Logger, storageManager: import('../../support/storageManager.js').StorageManager, index: number, webdriver: import('selenium-webdriver').WebDriver, instantiatedDriver: import('selenium-webdriver').WebDriver);
    /**
     * @type {Object}
     */
    options: any;
    /**
     * @type {Object}
     */
    result: any;
    /**
     * @type {intel.Logger}
     */
    log: intel.Logger;
    /**
     * @type {number}
     */
    index: number;
    /**
     * @type {import('../../support/storageManager.js').StorageManager}
     */
    storageManager: import('../../support/storageManager.js').StorageManager;
    /**
     * @type {Object}
     */
    taskData: any;
    /**
     * @type {{webdriver: import('selenium-webdriver').WebDriver, driver: import('selenium-webdriver').WebDriver}}
     */
    selenium: {
        webdriver: import('selenium-webdriver').WebDriver;
        driver: import('selenium-webdriver').WebDriver;
    };
}
//# sourceMappingURL=context.d.ts.map