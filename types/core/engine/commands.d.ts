/**
 * Represents the set of commands available in a Browsertime script.
 * @hideconstructor
 */
export class Commands {
    constructor({ browser, engineDelegate, index, result, storageManager, pageCompleteCheck, context, videos, screenshotManager, scriptsByCategory, asyncScriptsByCategory, postURLScripts, options }: {
        browser: any;
        engineDelegate: any;
        index: any;
        result: any;
        storageManager: any;
        pageCompleteCheck: any;
        context: any;
        videos: any;
        screenshotManager: any;
        scriptsByCategory: any;
        asyncScriptsByCategory: any;
        postURLScripts: any;
        options: any;
    });
    /**
     * Provides functionality to collect perfetto traces.
     * @type {PerfettoTrace}
     */
    perfetto: PerfettoTrace;
    /**
     * Provides functionality to collect simpleperf profiles.
     * @type {SimplePerfProfiler}
     */
    simpleperf: SimplePerfProfiler;
    profiler: GeckoProfilerCommand;
    perfStats: PerfStatsInterface;
    /**
     * Manages Chrome trace functionality, enabling custom profiling and trace collection in Chrome.
     * @type {ChromeTrace}
     */
    trace: ChromeTrace;
    /**
     * Click on an element using a unified selector string.
     * Supports CSS selectors (default), and prefixes: 'id:', 'xpath:', 'text:', 'link:', 'name:', 'class:'.
     * @async
     * @example await commands.click('#login-btn');
     * @example await commands.click('id:login-btn');
     * @example await commands.click('text:Submit', { waitForNavigation: true });
     * @param {string} selector - The selector string.
     * @param {Object} [clickOptions] - Options for the click.
     * @param {boolean} [clickOptions.waitForNavigation=false] - If true, waits for the page to complete loading after clicking.
     * @returns {Promise<void>}
     */
    click: (selector: string, clickOptions?: {
        waitForNavigation?: boolean;
    }) => Promise<void>;
    /**
     * Provides functionality to control page scrolling in the browser.
     * @type {Scroll}
     */
    scroll: Scroll;
    /**
     * Add text to an element using a unified selector string.
     * @async
     * @example await commands.addText('#search-input', 'search term');
     * @example await commands.addText('id:username', 'myuser');
     * @param {string} selector - The selector string.
     * @param {string} text - The text to add.
     * @returns {Promise<void>}
     */
    addText: (selector: string, text: string) => Promise<void>;
    /**
     * Wait for an element using a unified selector string.
     * @async
     * @example await commands.wait('#my-element', { timeout: 5000 });
     * @example await commands.wait('id:loaded', { timeout: 3000, visible: true });
     * @param {string} selector - The selector string.
     * @param {Object} [waitOptions] - Options for waiting.
     * @param {number} [waitOptions.timeout=6000] - Maximum time to wait in ms.
     * @param {boolean} [waitOptions.visible=false] - Wait for visibility.
     * @returns {Promise<void>}
     */
    wait: (selector: string, waitOptions?: {
        timeout?: number;
        visible?: boolean;
    }) => Promise<void>;
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
     * Set a property on an element using a unified selector string.
     * @async
     * @example await commands.set('#field', 'new value');
     * @example await commands.set('id:title', '<h1>Hello</h1>', 'innerHTML');
     * @param {string} selector - The selector string for the element.
     * @param {string} setValue - The value to set.
     * @param {string} [property='value'] - The property: 'value', 'innerText', or 'innerHTML'.
     * @returns {Promise<void>}
     */
    set: (selector: string, setValue: string, property?: string) => Promise<void>;
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
     * Manages browser cookies — get, set, delete individual or all cookies.
     * @type {Cookie}
     */
    cookie: Cookie;
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
    mouse: {
        moveTo: (selector: any) => Promise<void>;
        singleClick: (selector: any, mouseOptions: any) => Promise<any>;
        doubleClick: (selector: any) => Promise<void>;
        contextClick: (selector: any) => Promise<void>;
        clickAndHold: ClickAndHold;
    };
    /**
     * Select an option in a select element using a unified selector string.
     * @async
     * @example await commands.select('#country', 'SE');
     * @example await commands.select('id:language', 'en');
     * @param {string} selector - The selector string for the select element.
     * @param {string} selectValue - The value of the option to select.
     * @returns {Promise<void>}
     */
    select: (selector: string, selectValue: string) => Promise<void>;
    /**
     * Selenium's action sequence functionality.
     * @type {Actions}
     * @see https://www.selenium.dev/documentation/webdriver/actions_api/
     */
    action: Actions;
    /**
     * Types text into an element identified by a CSS selector.
     * This is a convenience method that wraps {@link AddText#bySelector addText.bySelector}
     * with a more conventional parameter order (selector first, then text).
     * @async
     * @example await commands.type('#search-input', 'search term');
     * @param {string} selector - The CSS selector of the element.
     * @param {string} text - The text to type into the element.
     * @returns {Promise<void>} A promise that resolves when the text has been added.
     * @throws {Error} Throws an error if the element is not found.
     * @type {Function}
     */
    type: Function;
    element: Element;
    /**
     * Finds an element using a CSS selector, with optional waiting and visibility check.
     * @async
     * @example const element = await commands.find('.my-element', { timeout: 5000, visible: true });
     * @param {string} selector - The CSS selector of the element.
     * @param {Object} [options] - Options for finding the element.
     * @param {number} [options.timeout] - Maximum time in milliseconds to wait for the element. Defaults to the configured --timeouts.elementWait value.
     * @param {boolean} [options.visible=false] - If true, waits for the element to be visible.
     * @returns {Promise<WebElement>} A promise that resolves to the WebElement found.
     * @throws {Error} Throws an error if the element is not found.
     * @type {Function}
     */
    find: Function;
    /**
     * Checks if an element matching the selector exists in the DOM.
     * Unlike find(), this does not throw if the element is not found.
     * @async
     * @example
     * if (await commands.exists('#cookie-banner')) {
     *   await commands.click('#accept-cookies');
     * }
     * @param {string} selector - The CSS selector or prefixed selector.
     * @param {Object} [existsOptions] - Options.
     * @param {number} [existsOptions.timeout=0] - Maximum time to wait for the element. Default 0 (no wait).
     * @returns {Promise<boolean>} True if the element exists.
     * @type {Function}
     */
    exists: Function;
    /**
     * Gets the visible text of an element matching the selector.
     * @async
     * @example const text = await commands.getText('#greeting');
     * @example const text = await commands.getText('id:heading');
     * @param {string} selector - The CSS selector or prefixed selector.
     * @returns {Promise<string>} The visible text content.
     * @throws {Error} Throws an error if the element is not found.
     * @type {Function}
     */
    getText: Function;
    /**
     * Gets the value of a form element matching the selector.
     * @async
     * @example const value = await commands.getValue('#price');
     * @example const value = await commands.getValue('id:email');
     * @param {string} selector - The CSS selector or prefixed selector.
     * @returns {Promise<string>} The element's value.
     * @throws {Error} Throws an error if the element is not found.
     * @type {Function}
     */
    getValue: Function;
    /**
     * Checks if an element matching the selector is visible/displayed.
     * @async
     * @example const visible = await commands.isVisible('#error-message');
     * @param {string} selector - The CSS selector or prefixed selector.
     * @returns {Promise<boolean>} True if the element is visible.
     * @throws {Error} Throws an error if the element is not found.
     * @type {Function}
     */
    isVisible: Function;
    /**
     * Gets an attribute value of an element matching the selector.
     * @async
     * @example const href = await commands.getAttribute('#my-link', 'href');
     * @example const dataId = await commands.getAttribute('id:item', 'data-id');
     * @param {string} selector - The CSS selector or prefixed selector.
     * @param {string} attribute - The attribute name.
     * @returns {Promise<string>} The attribute value.
     * @throws {Error} Throws an error if the element is not found.
     * @type {Function}
     */
    getAttribute: Function;
    /**
     * Checks if a form element matching the selector is enabled.
     * @async
     * @example const enabled = await commands.isEnabled('#submit-btn');
     * @param {string} selector - The CSS selector or prefixed selector.
     * @returns {Promise<boolean>} True if the element is enabled.
     * @throws {Error} Throws an error if the element is not found.
     * @type {Function}
     */
    isEnabled: Function;
    /**
     * Checks if a checkbox or radio button is selected/checked.
     * @async
     * @example const checked = await commands.isChecked('#agree-checkbox');
     * @param {string} selector - The CSS selector or prefixed selector.
     * @returns {Promise<boolean>} True if the element is checked/selected.
     * @throws {Error} Throws an error if the element is not found.
     * @type {Function}
     */
    isChecked: Function;
    /**
     * Clears the content of a form element matching the selector.
     * @async
     * @example await commands.clear('#search-input');
     * @example await commands.clear('id:email');
     * @param {string} selector - The CSS selector or prefixed selector.
     * @returns {Promise<void>} A promise that resolves when the element is cleared.
     * @throws {Error} Throws an error if the element is not found.
     * @type {Function}
     */
    clear: Function;
    /**
     * Fills multiple form fields at once. Each key is a selector, each value is the text to type.
     * @async
     * @example
     * await commands.fill({
     *   '#username': 'admin',
     *   '#password': 'secret',
     *   'id:email': 'user@example.com'
     * });
     * @param {Object<string, string>} fields - An object mapping selectors to values.
     * @returns {Promise<void>} A promise that resolves when all fields are filled.
     * @throws {Error} Throws an error if any element is not found.
     * @type {Function}
     */
    fill: Function;
    /**
     * Hovers over an element matching the selector. This is a convenience
     * alias for commands.mouse.moveTo(selector).
     * @async
     * @example await commands.hover('#menu-item');
     * @example await commands.hover('id:tooltip-trigger');
     * @param {string} selector - The CSS selector or prefixed selector.
     * @returns {Promise<void>}
     * @throws {Error} Throws an error if the element is not found.
     * @type {Function}
     */
    hover: Function;
    /**
     * Presses a keyboard key. Use key names like 'Enter', 'Tab', 'Escape',
     * 'Backspace', 'ArrowUp', 'ArrowDown', etc.
     * @async
     * @example await commands.press('Enter');
     * @example await commands.press('Tab');
     * @example await commands.press('Escape');
     * @param {string} key - The key name to press (e.g. 'Enter', 'Tab', 'Escape').
     * @returns {Promise<void>}
     * @type {Function}
     */
    press: Function;
    /**
     * Gets the title of the current page.
     * @async
     * @example const title = await commands.getTitle();
     * @returns {Promise<string>} The page title.
     * @type {Function}
     */
    getTitle: Function;
    /**
     * Gets the URL of the current page.
     * @async
     * @example const url = await commands.getUrl();
     * @returns {Promise<string>} The current URL.
     * @type {Function}
     */
    getUrl: Function;
    /**
     * Checks a checkbox or radio button. Does nothing if already checked.
     * @async
     * @example await commands.check('#agree-terms');
     * @example await commands.check('id:newsletter-opt-in');
     * @param {string} selector - The CSS selector or prefixed selector.
     * @returns {Promise<void>}
     * @throws {Error} Throws an error if the element is not found.
     * @type {Function}
     */
    check: Function;
    /**
     * Unchecks a checkbox. Does nothing if already unchecked.
     * @async
     * @example await commands.uncheck('#agree-terms');
     * @example await commands.uncheck('id:newsletter-opt-in');
     * @param {string} selector - The CSS selector or prefixed selector.
     * @returns {Promise<void>}
     * @throws {Error} Throws an error if the element is not found.
     * @type {Function}
     */
    uncheck: Function;
    /**
     * Scrolls the page so that the element matching the selector is visible in the viewport.
     * @async
     * @example await commands.scrollIntoView('#footer');
     * @example await commands.scrollIntoView('id:comments-section');
     * @param {string} selector - The CSS selector or prefixed selector.
     * @returns {Promise<void>}
     * @throws {Error} Throws an error if the element is not found.
     * @type {Function}
     */
    scrollIntoView: Function;
    /**
     * Waits until the browser's current URL contains the given string.
     * Useful after form submissions, login redirects, or SPA navigation.
     * @async
     * @example await commands.waitForUrl('dashboard');
     * @example await commands.waitForUrl('/account', { timeout: 10000 });
     * @param {string} pattern - The string to match against the current URL.
     * @param {Object} [urlOptions] - Options.
     * @param {number} [urlOptions.timeout=10000] - Maximum time to wait in milliseconds.
     * @returns {Promise<void>}
     * @throws {Error} Throws an error if the URL does not match within the timeout.
     * @type {Function}
     */
    waitForUrl: Function;
}
import { PerfettoTrace } from './command/perfetto.js';
import { SimplePerfProfiler } from './command/simpleperf.js';
import { GeckoProfiler as GeckoProfilerCommand } from './command/geckoProfiler.js';
import { PerfStatsInterface } from './command/perfStats.js';
import { ChromeTrace } from './command/chromeTrace.js';
import { Scroll } from './command/scroll.js';
import { Measure } from './command/measure.js';
import { Navigation } from './command/navigation.js';
import { JavaScript } from './command/javaScript.js';
import { Switch } from './command/switch.js';
import { Watch as StopWatch } from './command/stopWatch.js';
import { Cache } from './command/cache.js';
import { Cookie } from './command/cookie.js';
import { Meta } from './command/meta.js';
import { Screenshot } from './command/screenshot.js';
import { ChromeDevelopmentToolsProtocol } from './command/chromeDevToolsProtocol.js';
import { Bidi } from './command/bidi.js';
import { AndroidCommand } from './command/android.js';
import { Debug } from './command/debug.js';
import { ClickAndHold } from './command/mouse/index.js';
import { Actions } from './command/actions.js';
import { Element } from './command/element.js';
//# sourceMappingURL=commands.d.ts.map