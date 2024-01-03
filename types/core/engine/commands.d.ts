/**
 * Represents the set of commands available in a Browsertime script.
 *
 */
export class Commands {
    constructor(browser: any, engineDelegate: any, index: any, result: any, storageManager: any, pageCompleteCheck: any, extensionServer: any, context: any, videos: any, screenshotManager: any, scriptsByCategory: any, asyncScriptsByCategory: any, postURLScripts: any, options: any);
    profiler: GeckoProfilerCommand;
    trace: ChromeTrace;
    android: AndroidCommand;
    debug: Debug;
    click: Click;
    scroll: Scroll;
    addText: AddText;
    wait: Wait;
    measure: Measure;
    navigate: any;
    navigation: Navigation;
    error: any;
    markAsFailure: any;
    js: JavaScript;
    switch: Switch;
    set: Set;
    stopWatch: StopWatch;
    cache: Cache;
    meta: Meta;
    screenshot: Screenshot;
    cdp: ChromeDevelopmentToolsProtocol;
    mouse: {
        moveTo: MouseMove;
        contextClick: ContextClick;
        singleClick: SingleClick;
        doubleClick: DoubleClick;
        clickAndHold: ClickAndHold;
    };
    select: Select;
}
import { GeckoProfiler as GeckoProfilerCommand } from './command/geckoProfiler.js';
import { ChromeTrace } from './command/chromeTrace.js';
import { AndroidCommand } from './command/android.js';
import { Debug } from './command/debug.js';
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
import { MouseMove } from './command/mouse/index.js';
import { ContextClick } from './command/mouse/index.js';
import { SingleClick } from './command/mouse/index.js';
import { DoubleClick } from './command/mouse/index.js';
import { ClickAndHold } from './command/mouse/index.js';
import { Select } from './command/select.js';
//# sourceMappingURL=commands.d.ts.map