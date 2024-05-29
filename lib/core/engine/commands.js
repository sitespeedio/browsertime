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
/**
 * Represents the set of commands available in a Browsertime script.
 * @hideconstructor
 */
export class Commands {
  constructor(
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
  ) {
    const measure = new Measure(
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
    );

    const browserProfiler = new GeckoProfiler(browser, storageManager, options);
    // Profiler
    this.profiler = new GeckoProfilerCommand(
      browserProfiler,
      browser,
      index,
      options,
      result
    );
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
     * @type {Click}
     */
    this.click = new Click(browser, pageCompleteCheck);

    /**
     * Provides functionality to control page scrolling in the browser.
     * @type {Scroll}
     */
    this.scroll = new Scroll(browser, options);

    /**
     * Provides functionality to add text to elements on a web page using various selectors.
     * @type {AddText}
     */
    this.addText = new AddText(browser);

    /**
     * Provides functionality to wait for different conditions in the browser.
     * @type {Wait}
     */
    this.wait = new Wait(browser, pageCompleteCheck);

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
     * @type {Set}
     */
    this.set = new Set(browser);

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
    this.mouse = {
      /**
       *  Move the mouse cursor to elements or specific positions on a web page.
       * @type {MouseMove}
       */
      moveTo: new MouseMove(browser),
      /**
       *  Perform a context click (right-click) on elements in a web page.
       * @type {ContextClick}
       */
      contextClick: new ContextClick(browser),
      /**
       *  Provides functionality to perform a single click action on elements or at specific positions in a web page.
       * @type {SingleClick}
       */
      singleClick: new SingleClick(browser, pageCompleteCheck),
      /**
       *  Provides functionality to perform a double-click action on elements in a web page.
       * @type {DoubleClick}
       */
      doubleClick: new DoubleClick(browser, pageCompleteCheck),
      /**
       *  Provides functionality to click and hold elements on a web page using different strategies.
       * @type {ClickAndHold}
       */
      clickAndHold: new ClickAndHold(browser)
    };

    /**
     * Interact with a select element.
     * @type {Select}
     */
    this.select = new Select(browser);

    /**
     * Selenium's action sequence functionality.
     * @type {Actions}
     * @see https://www.selenium.dev/documentation/webdriver/actions_api/
     */
    this.action = new Actions(browser);

    /**
     * Get Selenium's WebElements.
     * @type {Element}
     */
    this.element = new Element(browser);
  }
}
