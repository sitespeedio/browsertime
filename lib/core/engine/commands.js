import webdriver from 'selenium-webdriver';

import { parseSelector } from './command/selectorParser.js';
import { Actions } from './command/actions.js';
import { AddText } from './command/addText.js';
import { Click } from './command/click.js';
import { Element } from './command/element.js';
import { Wait } from './command/wait.js';
import { Measure } from './command/measure.js';
import { JavaScript } from './command/javaScript.js';
import { Switch } from './command/switch.js';
import { Screenshot } from './command/screenshot.js';
import { Set } from './command/set.js';
import { Cache } from './command/cache.js';
import { Cookie } from './command/cookie.js';
import { Meta } from './command/meta.js';
import { Watch as StopWatch } from './command/stopWatch.js';
import { Select } from './command/select.js';
import { Debug } from './command/debug.js';
import { Bidi } from './command/bidi.js';
import { AndroidCommand } from './command/android.js';
import { ChromeDevelopmentToolsProtocol } from './command/chromeDevToolsProtocol.js';
import { ChromeTrace } from './command/chromeTrace.js';
import {
  SingleClick,
  DoubleClick,
  ClickAndHold,
  ContextClick,
  MouseMove
} from './command/mouse/index.js';
import { Scroll } from './command/scroll.js';
import { Navigation } from './command/navigation.js';
import { GeckoProfiler } from '../../firefox/geckoProfiler.js';
import { GeckoProfiler as GeckoProfilerCommand } from './command/geckoProfiler.js';
import { PerfStatsInterface } from './command/perfStats.js';
import { PerfettoTrace } from './command/perfetto.js';
import { SimplePerfProfiler } from './command/simpleperf.js';
/**
 * Represents the set of commands available in a Browsertime script.
 * @hideconstructor
 */
export class Commands {
  constructor({
    browser,
    engineDelegate,
    index,
    result,
    storageManager,
    pageCompleteCheck,
    context,
    videos,
    screenshotManager,
    scriptsByCategory,
    asyncScriptsByCategory,
    postURLScripts,
    options
  }) {
    const measure = new Measure({
      browser,
      index,
      pageCompleteCheck,
      result,
      engineDelegate,
      storageManager,
      videos,
      scriptsByCategory,
      asyncScriptsByCategory,
      postURLScripts,
      context,
      screenshotManager,
      options
    });

    /**
     * Provides functionality to collect perfetto traces.
     * @type {PerfettoTrace}
     */
    this.perfetto = new PerfettoTrace(browser, index, storageManager, options);

    /**
     * Provides functionality to collect simpleperf profiles.
     * @type {SimplePerfProfiler}
     */
    this.simpleperf = new SimplePerfProfiler(
      browser,
      index,
      storageManager,
      options
    );

    /**
     * Manages GeckoProfiler functionality to collect performance profiles.
     * @type {GeckoProfiler}
     */
    const browserProfiler = new GeckoProfiler(browser, storageManager, options);
    // Profiler
    this.profiler = new GeckoProfilerCommand(
      browserProfiler,
      browser,
      index,
      options,
      result
    );

    /**
     * Manages PerfStats functionality to collect performance counters.
     * @type {PerfStatsInterface}
     */
    const perfStats = new PerfStatsInterface(browser, options);
    this.perfStats = perfStats;

    const cdp = new ChromeDevelopmentToolsProtocol(
      engineDelegate,
      options.browser
    );

    /**
     * Manages Chrome trace functionality, enabling custom profiling and trace collection in Chrome.
     * @type {ChromeTrace}
     */
    this.trace = new ChromeTrace(engineDelegate, index, options, result);

    /**
     * Provides functionality to perform click actions on elements in a web page using various selectors.
     * Can be called directly as a function with a unified selector string, or use the
     * existing by* methods for backward compatibility.
     * @type {Function & Click}
     */
    const clickInstance = new Click(browser, pageCompleteCheck, options);

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
    this.click = async (selector, clickOptions) =>
      clickInstance.run(selector, clickOptions);
    // Preserve all existing by* methods for backward compatibility
    for (const key of Object.getOwnPropertyNames(
      Object.getPrototypeOf(clickInstance)
    )) {
      if (key !== 'constructor' && typeof clickInstance[key] === 'function') {
        this.click[key] = clickInstance[key].bind(clickInstance);
      }
    }

    measure.setClick(this.click);

    /**
     * Provides functionality to control page scrolling in the browser.
     * @type {Scroll}
     */
    this.scroll = new Scroll(browser, options);

    /**
     * Provides functionality to add text to elements on a web page using various selectors.
     * Can be called directly as a function with a unified selector string, or use the
     * existing by* methods for backward compatibility.
     * @type {Function & AddText}
     */
    const addTextInstance = new AddText(browser, options);

    /**
     * Add text to an element using a unified selector string.
     * @async
     * @example await commands.addText('#search-input', 'search term');
     * @example await commands.addText('id:username', 'myuser');
     * @param {string} selector - The selector string.
     * @param {string} text - The text to add.
     * @returns {Promise<void>}
     */
    this.addText = async (selector, text) =>
      addTextInstance.run(selector, text);
    // Preserve all existing by* methods for backward compatibility
    for (const key of Object.getOwnPropertyNames(
      Object.getPrototypeOf(addTextInstance)
    )) {
      if (key !== 'constructor' && typeof addTextInstance[key] === 'function') {
        this.addText[key] = addTextInstance[key].bind(addTextInstance);
      }
    }

    /**
     * Provides functionality to wait for different conditions in the browser.
     * Can be called directly as a function with a unified selector string, or use the
     * existing by* methods for backward compatibility.
     * @type {Function & Wait}
     */
    const waitInstance = new Wait(browser, pageCompleteCheck);

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
    this.wait = async (selector, waitOptions) =>
      waitInstance.run(selector, waitOptions);
    // Preserve all existing by* methods for backward compatibility
    for (const key of Object.getOwnPropertyNames(
      Object.getPrototypeOf(waitInstance)
    )) {
      if (key !== 'constructor' && typeof waitInstance[key] === 'function') {
        this.wait[key] = waitInstance[key].bind(waitInstance);
      }
    }

    /**
     * Provides functionality for measuring a navigation.
     * @type {Measure}
     */
    this.measure = measure;

    /**
     * Navigates to a specified URL and handles additional setup for a page visit.
     * @async
     * @example await commands.navigate('https://www.example.org');
     * @type {Function}
     * @param {string} url - The URL to navigate to.
     * @throws {Error} Throws an error if navigation or setup fails.
     * @returns {Promise<void>} A promise that resolves when the navigation and setup are
     */
    this.navigate = measure._navigate.bind(measure);

    /**
     *  Provides functionality to control browser navigation such as back, forward, and refresh actions.
     * @type {Navigation}
     */
    this.navigation = new Navigation(browser, pageCompleteCheck);

    /**
     * Add a text that will be an error attached to the current page.
     * @example await commands.error('My error message');
     * @param {string} message - The error message.
     * @type {Function}
     */
    this.error = measure._error.bind(measure);

    /**
     * Mark this run as an failure. Add a message that explains the failure.
     * @example await commands.markAsFailure('My failure message');
     * @param {string} message - The message attached as a failure
     * @type {Function}
     */
    this.markAsFailure = measure._failure.bind(measure);

    /**
     * Executes JavaScript in the browser context.
     * @type {JavaScript}
     */
    this.js = new JavaScript(browser, pageCompleteCheck);

    /**
     * Switches context to different frames, windows, or tabs in the browser.
     * @type {Switch}
     */
    this.switch = new Switch(
      browser,
      pageCompleteCheck,
      measure._navigate.bind(measure)
    );

    /**
     * Sets values on HTML elements in the page.
     * Can be called directly as a function with a unified selector string, or use the
     * existing by* methods for backward compatibility.
     * @type {Function & Set}
     */
    const setInstance = new Set(browser, options);

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
    this.set = async (selector, setValue, property) =>
      setInstance.run(selector, setValue, property);
    // Preserve all existing by* methods for backward compatibility
    for (const key of Object.getOwnPropertyNames(
      Object.getPrototypeOf(setInstance)
    )) {
      if (key !== 'constructor' && typeof setInstance[key] === 'function') {
        this.set[key] = setInstance[key].bind(setInstance);
      }
    }

    /**
     * Stopwatch utility for measuring time intervals.
     * @type {StopWatch}
     */
    this.stopWatch = new StopWatch(measure);

    /**
     * Manages the browser's cache.
     * @type {Cache}
     */
    this.cache = new Cache(browser, options.browser, cdp);

    /**
     * Manages browser cookies — get, set, delete individual or all cookies.
     * @type {Cookie}
     */
    this.cookie = new Cookie(browser);

    /**
     * Adds metadata to the user journey.
     * @type {Meta}
     */
    this.meta = new Meta();

    /**
     * Takes and manages screenshots.
     * @type {Screenshot}
     */
    this.screenshot = new Screenshot(screenshotManager, browser, index);

    /**
     * Use the Chrome DevTools Protocol, available in Chrome and Edge.
     * @type {ChromeDevelopmentToolsProtocol}
     */
    this.cdp = cdp;

    /**
     *
     * Use WebDriver Bidi. Availible in Firefox and in the future more browsers.
     * @type {Bidi}
     */
    this.bidi = new Bidi(engineDelegate, options.browser);

    /**
     * Provides commands for interacting with an Android device.
     * @type {AndroidCommand}
     */
    this.android = new AndroidCommand(options);

    /**
     * Provides debugging capabilities within a browser automation script.
     * It allows setting breakpoints to pause script execution and inspect the current state.
     *  @type {Debug}
     */
    this.debug = new Debug(browser, options);

    /**
     * Interact with the page using the mouse.
     * @type {Object}
     */
    const singleClickInstance = new SingleClick(
      browser,
      pageCompleteCheck,
      options
    );
    const doubleClickInstance = new DoubleClick(
      browser,
      pageCompleteCheck,
      options
    );
    const contextClickInstance = new ContextClick(browser, options);
    const mouseMoveInstance = new MouseMove(browser, options);
    const clickAndHoldInstance = new ClickAndHold(browser);

    this.mouse = {
      moveTo: async selector => mouseMoveInstance.run(selector),
      singleClick: async (selector, mouseOptions) =>
        singleClickInstance.run(selector, mouseOptions),
      doubleClick: async selector => doubleClickInstance.run(selector),
      contextClick: async selector => contextClickInstance.run(selector),
      clickAndHold: clickAndHoldInstance
    };

    // Preserve backward-compatible methods on each mouse command
    for (const key of Object.getOwnPropertyNames(
      Object.getPrototypeOf(mouseMoveInstance)
    )) {
      if (
        key !== 'constructor' &&
        typeof mouseMoveInstance[key] === 'function'
      ) {
        this.mouse.moveTo[key] = mouseMoveInstance[key].bind(mouseMoveInstance);
      }
    }
    for (const key of Object.getOwnPropertyNames(
      Object.getPrototypeOf(singleClickInstance)
    )) {
      if (
        key !== 'constructor' &&
        typeof singleClickInstance[key] === 'function'
      ) {
        this.mouse.singleClick[key] =
          singleClickInstance[key].bind(singleClickInstance);
      }
    }
    for (const key of Object.getOwnPropertyNames(
      Object.getPrototypeOf(doubleClickInstance)
    )) {
      if (
        key !== 'constructor' &&
        typeof doubleClickInstance[key] === 'function'
      ) {
        this.mouse.doubleClick[key] =
          doubleClickInstance[key].bind(doubleClickInstance);
      }
    }
    for (const key of Object.getOwnPropertyNames(
      Object.getPrototypeOf(contextClickInstance)
    )) {
      if (
        key !== 'constructor' &&
        typeof contextClickInstance[key] === 'function'
      ) {
        this.mouse.contextClick[key] =
          contextClickInstance[key].bind(contextClickInstance);
      }
    }

    /**
     * Interact with a select element.
     * Can be called directly as a function with a unified selector string, or use the
     * existing by* methods for backward compatibility.
     * @type {Function & Select}
     */
    const selectInstance = new Select(browser, options);

    /**
     * Select an option in a select element using a unified selector string.
     * @async
     * @example await commands.select('#country', 'SE');
     * @example await commands.select('id:language', 'en');
     * @param {string} selector - The selector string for the select element.
     * @param {string} selectValue - The value of the option to select.
     * @returns {Promise<void>}
     */
    this.select = async (selector, selectValue) =>
      selectInstance.run(selector, selectValue);
    // Preserve all existing by* methods for backward compatibility
    for (const key of Object.getOwnPropertyNames(
      Object.getPrototypeOf(selectInstance)
    )) {
      if (key !== 'constructor' && typeof selectInstance[key] === 'function') {
        this.select[key] = selectInstance[key].bind(selectInstance);
      }
    }

    /**
     * Selenium's action sequence functionality.
     * @type {Actions}
     * @see https://www.selenium.dev/documentation/webdriver/actions_api/
     */
    this.action = new Actions(browser);

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
    this.type = async (selector, text) => {
      return this.addText(selector, text);
    };
    this.element = new Element(browser, options);

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
    this.find = this.element.find.bind(this.element);

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
    this.exists = async (selector, existsOptions = {}) => {
      const { locator } = parseSelector(selector);
      const timeout = existsOptions.timeout ?? 0;
      const driver = browser.getDriver();
      try {
        await (timeout > 0
          ? driver.wait(webdriver.until.elementLocated(locator), timeout)
          : driver.findElement(locator));
        return true;
      } catch {
        return false;
      }
    };

    const findElement = async selector => {
      const { locator } = parseSelector(selector);
      const driver = browser.getDriver();
      const timeout = options?.timeouts?.elementWait ?? 0;
      if (timeout > 0) {
        await driver.wait(webdriver.until.elementLocated(locator), timeout);
      }
      return driver.findElement(locator);
    };

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
    this.getText = async selector => {
      const element = await findElement(selector);
      return element.getText();
    };

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
    this.getValue = async selector => {
      const element = await findElement(selector);
      return element.getAttribute('value');
    };

    /**
     * Checks if an element matching the selector is visible/displayed.
     * @async
     * @example const visible = await commands.isVisible('#error-message');
     * @param {string} selector - The CSS selector or prefixed selector.
     * @returns {Promise<boolean>} True if the element is visible.
     * @throws {Error} Throws an error if the element is not found.
     * @type {Function}
     */
    this.isVisible = async selector => {
      const element = await findElement(selector);
      return element.isDisplayed();
    };

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
    this.clear = async selector => {
      const { locator } = parseSelector(selector);
      const driver = browser.getDriver();
      const timeout = options?.timeouts?.elementWait ?? 0;
      if (timeout > 0) {
        await driver.wait(webdriver.until.elementLocated(locator), timeout);
      }
      const element = await driver.findElement(locator);
      return element.clear();
    };

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
    this.fill = async fields => {
      for (const [selector, text] of Object.entries(fields)) {
        await this.addText(selector, text);
      }
    };

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
    this.hover = async selector => {
      return this.mouse.moveTo(selector);
    };

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
    this.press = async key => {
      const keyValue = webdriver.Key[key.toUpperCase()] || key;
      const driver = browser.getDriver();
      await driver.actions({ async: true }).sendKeys(keyValue).perform();
      return driver.actions().clear();
    };

    /**
     * Gets the title of the current page.
     * @async
     * @example const title = await commands.getTitle();
     * @returns {Promise<string>} The page title.
     * @type {Function}
     */
    this.getTitle = async () => {
      return browser.getDriver().getTitle();
    };

    /**
     * Gets the URL of the current page.
     * @async
     * @example const url = await commands.getUrl();
     * @returns {Promise<string>} The current URL.
     * @type {Function}
     */
    this.getUrl = async () => {
      return browser.getDriver().getCurrentUrl();
    };
  }
}
