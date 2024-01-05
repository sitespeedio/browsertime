/**
 * A measurement tool for browser-based metrics, handling various aspects
 * of metric collection including navigation, video recording, and data collection.
 *
 * @class
 * @hideconstructor
 */
export class Measure {
    constructor(browser: any, index: any, pageCompleteCheck: any, result: any, engineDelegate: any, extensionServer: any, storageManager: any, videos: any, scriptsByCategory: any, asyncScriptsByCategory: any, postURLScripts: any, context: any, screenshotManager: any, options: any);
    /**
     * @private
     */
    private browser;
    /**
     * @private
     */
    private pageCompleteCheck;
    /**
     * @private
     */
    private index;
    /**
     * @private
     */
    private result;
    /**
     * @private
     */
    private engineDelegate;
    /**
     * @private
     */
    private options;
    /**
     * @private
     */
    private screenshotManager;
    /**
     * @private
     */
    private storageManager;
    /**
     * @private
     */
    private recordVideo;
    /**
     * @private
     */
    private extensionServer;
    /**
     * @private
     */
    private videos;
    /**
     * @private
     */
    private scriptsByCategory;
    /**
     * @private
     */
    private asyncScriptsByCategory;
    /**
     * @private
     */
    private postURLScripts;
    /**
     * @private
     */
    private context;
    /**
     * @private
     */
    private numberOfMeasuredPages;
    /**
     * @private
     */
    private numberOfVisitedPages;
    /**
     * @private
     */
    private areWeMeasuring;
    /**
     * @private
     */
    private testedURLs;
    /**
     * @private
     */
    private tcpDump;
    /**
     * @private
     */
    private ANDROID_DELAY_TIME;
    /**
     * @private
     */
    private IOS_DELAY_TIME;
    /**
     * @private
     */
    private DESKTOP_DELAY_TIME;
    /**
     * Have a consistent way of starting the video
     * @private
     */
    private _startVideo;
    video: Video;
    /**
     * Have a consistent way of starting stopping the video
     * @private
     */
    private _stopVideo;
    /**
     * Have a consistent way of adding an error
     * @private
     */
    private _error;
    /**
     * Have a consistent way of adding an failure
     * @private
     */
    private _failure;
    /**
     * Navigates to a specified URL and handles additional setup for the first page visit.
     *
     * This function is responsible for setting up the browser with necessary configurations and
     * navigating to the URL. It also waits for the page
     * to load completely based on configured page completion check.
     *
     * @async
     * @private
     * @param {string} url - The URL to navigate to.
     * @throws {Error} Throws an error if navigation or setup fails.
     * @returns {Promise<void>} A promise that resolves when the navigation and setup are complete.
     */
    private _navigate;
    /**
     * Starts the measurement process for a given URL or an alias.
     *
     * It supports starting measurements by either directly providing a URL or using an alias.
     * If a URL is provided, it navigates to that URL and performs the measurement.
     * If an alias is provided, or no URL is available, it sets up the environment for a user-driven navigation.
     *
     * @async
     * @param {string} urlOrAlias - The URL to navigate to, or an alias representing the test.
     * @param {string} [optionalAlias] - An optional alias that can be used if the first parameter is a URL.
     * @throws {Error} Throws an error if navigation fails or if there are issues in the setup process.
     * @returns {Promise<void>} A promise that resolves when the start process is complete, or rejects if there are errors.
     */
    start(urlOrAlias: string, optionalAlias?: string): Promise<void>;
    /**
     * Stops the measurement process, collects metrics, and handles any post-measurement tasks.
     * It finalizes the URL being tested, manages any URL-specific metadata, stops any ongoing video recordings,
     * and initiates the data collection process.
     *
     * @async
     * @param {string} testedStartUrl - The URL that was initially tested. If not provided, it will be obtained from the browser.
     * @throws {Error} Throws an error if there are issues in stopping the measurement or collecting data.
     * @returns {Promise} A promise that resolves with the collected metrics data.
     */
    stop(testedStartUrl: string): Promise<any>;
    /**
     * Adds a custom metric to the current measurement result.
     * This method should be called after a measurement has started and before it has stopped.
     *
     * @param {string} name - The name of the metric.
     * @param {*} value - The value of the metric.
     * @throws {Error} Throws an error if called before a measurement cycle has started.
     */
    add(name: string, value: any): void;
    /**
     * Adds multiple custom metrics to the current measurement result.
     * This method accepts an object containing multiple key-value pairs representing different metrics.
     * Similar to `add`, it should be used within an active measurement cycle.
     *
     * @param {Object} object - An object containing key-value pairs of metrics to add.
     * @throws {Error} Throws an error if called before a measurement cycle has started.
     */
    addObject(object: any): void;
    /**
     *
     * @private
     */
    private collect;
}
import { Video } from '../../../video/video.js';
//# sourceMappingURL=measure.d.ts.map