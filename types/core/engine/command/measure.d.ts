export class Measure {
    constructor(browser: any, index: any, pageCompleteCheck: any, result: any, engineDelegate: any, extensionServer: any, storageManager: any, videos: any, scriptsByCategory: any, asyncScriptsByCategory: any, postURLScripts: any, context: any, screenshotManager: any, options: any);
    browser: any;
    pageCompleteCheck: any;
    index: any;
    result: any;
    engineDelegate: any;
    options: any;
    screenshotManager: any;
    storageManager: any;
    recordVideo: any;
    extensionServer: any;
    videos: any;
    scriptsByCategory: any;
    asyncScriptsByCategory: any;
    postURLScripts: any;
    context: any;
    numberOfMeasuredPages: number;
    numberOfVisitedPages: number;
    areWeMeasuring: boolean;
    testedURLs: {};
    tcpDump: TCPDump;
    ANDROID_DELAY_TIME: any;
    IOS_DELAY_TIME: any;
    DESKTOP_DELAY_TIME: any;
    _startVideo(numberOfMeasuredPages: any, index: any): Promise<any>;
    video: Video;
    _stopVideo(url: any): Promise<void>;
    _error(message: any): void;
    _failure(message: any): void;
    _navigate(url: any): Promise<any>;
    /**
     *  Start collecting metrics for a URL. If you supply a URL to this method, the browser will navigate to that URL.
     *  If you do not use an URL (start()) everything is prepared for a new page to measure except the browser do not
     *  navigate to a new URL. You can also add an alias for the URL.
     * @param {string} urlOrAlias
     * @param {string} optionalAlias
     * @returns {Promise} Promise object represents when the URL has been navigated and finished loading according to the pageCompleteCheck or when everything is setup for measuring a new URL (if no URL is supplied).
     */
    start(urlOrAlias: string, optionalAlias: string): Promise<any>;
    /**
     * Stop measuring and collect all the metrics.
     * @returns {Promise} Promise object represents all the metrics has been collected.
     */
    stop(testedStartUrl: any): Promise<any>;
    /**
     * Add your own metric.
     * @param {string} name
     * @param {*} value
     */
    add(name: string, value: any): void;
    /**
     * Add your own metrics. You can add an object witch multiple keys and they will all be collected.
     * @param {*} object
     */
    addObject(object: any): void;
    collect(url: any): Promise<void>;
}
import { TCPDump } from '../../../support/tcpdump.js';
import { Video } from '../../../video/video.js';
//# sourceMappingURL=measure.d.ts.map