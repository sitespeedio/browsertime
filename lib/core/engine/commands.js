import { AddText } from './command/addText.js';
import { Click } from './command/click.js';
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
import { AndroidCommand } from './command/android.js';
import { Android } from '../../android/index.js';
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
 *
 */
export class Commands {
  constructor(
    browser,
    engineDelegate,
    index,
    result,
    storageManager,
    pageCompleteCheck,
    extensionServer,
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
      extensionServer,
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
    this.trace = new ChromeTrace(engineDelegate, index, options, result);
    this.android = new Android(options);
    this.debug = new Debug(browser, options);
    this.click = new Click(browser, pageCompleteCheck);
    this.scroll = new Scroll(browser, options);
    this.addText = new AddText(browser);
    this.wait = new Wait(browser, pageCompleteCheck);
    this.measure = measure;
    this.navigate = measure._navigate.bind(measure);
    this.navigation = new Navigation(browser, pageCompleteCheck);
    this.error = measure._error.bind(measure);
    this.markAsFailure = measure._failure.bind(measure);
    this.js = new JavaScript(browser, pageCompleteCheck);
    this.switch = new Switch(
      browser,
      pageCompleteCheck,
      measure._navigate.bind(measure)
    );
    this.set = new Set(browser);
    this.stopWatch = new StopWatch(measure);
    this.cache = new Cache(browser, options.browser, extensionServer, cdp);
    this.meta = new Meta();
    this.screenshot = new Screenshot(screenshotManager, browser, index);
    this.cdp = cdp;
    this.android = new AndroidCommand(options);
    this.debug = new Debug(browser, options);
    this.mouse = {
      moveTo: new MouseMove(browser),
      contextClick: new ContextClick(browser),
      singleClick: new SingleClick(browser, pageCompleteCheck),
      doubleClick: new DoubleClick(browser, pageCompleteCheck),
      clickAndHold: new ClickAndHold(browser)
    };
    this.select = new Select(browser);
  }
}
