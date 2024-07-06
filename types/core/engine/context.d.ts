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
    constructor(options: any, result: any, log: any, storageManager: any, index: any, webdriver: any, instantiatedDriver: any);
    /**
     * This is the yargs object you get from the cli. If you add --my.id you can get that using options.my.id.
     * @type {Object}
     */
    options: any;
    /**
     * Here the result from each run is stored.
     * @type {Object}
     */
    result: any;
    /**
     * @type {Logger}
     */
    log: Logger;
    /**
     * The index of the iteration.
     * @type {number}
     */
    index: number;
    /**
     * Storage manager to save things to disk.
     * @type {import('../../support/storageManager.js').StorageManager}
     */
    storageManager: import("../../support/storageManager.js").StorageManager;
    /**
     * @type {Object}
     */
    taskData: any;
    /**
     * Get raw Selenium functionality.
     * @see https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/index.html
     * @type {{webdriver: WebDriverClass, driver: WebDriverInstance}}
     */
    selenium: {
        webdriver: typeof import("selenium-webdriver");
        driver: import("selenium-webdriver").WebDriver;
    };
}
export type Logger = {
    /**
     * - Function to log trace messages.
     */
    trace: (arg0: string) => void;
    /**
     * - Function to log verbose messages.
     */
    verbose: (arg0: string) => void;
    /**
     * - Function to log info messages.
     */
    info: (arg0: string) => void;
    /**
     * - Function to log warning messages.
     */
    warn: (arg0: string) => void;
    /**
     * - Function to log error messages.
     */
    error: (arg0: string) => void;
    /**
     * - Function to log critical messages.
     */
    critical: (arg0: string) => void;
};
export type WebDriverClass = typeof import("selenium-webdriver");
export type WebDriverInstance = import("selenium-webdriver").WebDriver;
//# sourceMappingURL=context.d.ts.map