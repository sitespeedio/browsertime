/**
 * Represents the set of commands available in a Browsertime script.
 * @hideconstructor
 */
export class Commands {
    constructor(browser: any, engineDelegate: any, index: any, result: any, storageManager: any, pageCompleteCheck: any, context: any, videos: any, screenshotManager: any, scriptsByCategory: any, asyncScriptsByCategory: any, postURLScripts: any, options: any);
    profiler: GeckoProfilerCommand;
    /**
     * Manages Chrome trace functionality, enabling custom profiling and trace collection in Chrome.
     * @type {ChromeTrace}
     */
    trace: ChromeTrace;
    /**
     * Provides functionality to perform click actions on elements in a web page using various selectors.
     * @type {Click}
     */
    click: Click;
    /**
     * Provides functionality to control page scrolling in the browser.
     * @type {Scroll}
     */
    scroll: Scroll;
    /**
     * Provides functionality to add text to elements on a web page using various selectors.
     * @type {AddText}
     */
    addText: AddText;
    /**
     * Provides functionality to wait for different conditions in the browser.
     * @type {Wait}
     */
    wait: Wait;
    /**
     * Provides functionality for measuring a navigation.
     * @type {Measure}
     */
    measure: Measure;
    /**
     * Navigates to a specified URL and handles additional setup for a page visit.
     * @async
     * @example await commands.navigate('https://www.example.org');
     * @type {Function}
     * @param {string} url - The URL to navigate to.
     * @throws {Error} Throws an error if navigation or setup fails.
     * @returns {Promise<void>} A promise that resolves when the navigation and setup are
     */
    navigate: Function;
    /**
     *  Provides functionality to control browser navigation such as back, forward, and refresh actions.
     * @type {Navigation}
     */
    navigation: Navigation;
    /**
     * Add a text that will be an error attached to the current page.
     * @example await commands.error('My error message');
     * @param {string} message - The error message.
     * @type {Function}
     */
    error: Function;
    /**
     * Mark this run as an failure. Add a message that explains the failure.
     * @example await commands.markAsFailure('My failure message');
     * @param {string} message - The message attached as a failure
     * @type {Function}
     */
    markAsFailure: Function;
    /**
     * Executes JavaScript in the browser context.
     * @type {JavaScript}
     */
    js: JavaScript;
    /**
     * Switches context to different frames, windows, or tabs in the browser.
     * @type {Switch}
     */
    switch: Switch;
    /**
     * Sets values on HTML elements in the page.
     * @type {Set}
     */
    set: Set;
    /**
     * Stopwatch utility for measuring time intervals.
     * @type {StopWatch}
     */
    stopWatch: StopWatch;
    /**
     * Manages the browser's cache.
     * @type {Cache}
     */
    cache: Cache;
    /**
     * Adds metadata to the user journey.
     * @type {Meta}
     */
    meta: Meta;
    /**
     * Takes and manages screenshots.
     * @type {Screenshot}
     */
    screenshot: Screenshot;
    /**
     * Use the Chrome DevTools Protocol, available in Chrome and Edge.
     * @type {ChromeDevelopmentToolsProtocol}
     */
    cdp: ChromeDevelopmentToolsProtocol;
    /**
     *
     * Use WebDriver Bidi. Availible in Firefox and in the future more browsers.
     * @type {Bidi}
     */
    bidi: Bidi;
    /**
     * Provides commands for interacting with an Android device.
     * @type {AndroidCommand}
     */
    android: AndroidCommand;
    /**
     * Provides debugging capabilities within a browser automation script.
     * It allows setting breakpoints to pause script execution and inspect the current state.
     *  @type {Debug}
     */
    debug: Debug;
    /**
     * Interact with the page using the mouse.
     * @type {Object}
     */
    mouse: any;
    /**
     * Interact with a select element.
     * @type {Select}
     */
    select: Select;
    /**
     * Selenium's action sequence functionality.
     * @type {Actions}
     * @see https://www.selenium.dev/documentation/webdriver/actions_api/
     */
    action: Actions;
    /**
     * Get Selenium's WebElements.
     * @type {Element}
     */
    element: Element;
}
import { GeckoProfiler as GeckoProfilerCommand } from './command/geckoProfiler.js';
import { ChromeTrace } from './command/chromeTrace.js';
import { Click } from './command/click.js';
import { Scroll } from './command/scroll.js';
import { AddText } from './command/addText.js';
import { Wait } from './command/wait.js';
import { Measure } from './command/measure.js';
import { Navigation } from './command/navigation.js';
import { JavaScript } from './command/javaScript.js';
import { Switch } from './command/switch.js';
import { Set } from './command/set.js';
import { Watch as StopWatch } from './command/stopWatch.js';
import { Cache } from './command/cache.js';
import { Meta } from './command/meta.js';
import { Screenshot } from './command/screenshot.js';
import { ChromeDevelopmentToolsProtocol } from './command/chromeDevToolsProtocol.js';
import { Bidi } from './command/bidi.js';
import { AndroidCommand } from './command/android.js';
import { Debug } from './command/debug.js';
import { Select } from './command/select.js';
import { Actions } from './command/actions.js';
import { Element } from './command/element.js';
//# sourceMappingURL=commands.d.ts.map