import { getLogger } from '@sitespeed.io/log';

import { getRenderBlocking } from '../../../chrome/webdriver/traceUtilities.js';
import { parse } from '../../../chrome/traceCategoriesParser.js';
import { parseCPUTrace } from '../../../chrome/parseCpuTrace.js';
const log = getLogger('browsertime.command.chrometrace');
/**
 * Manages Chrome trace functionality, enabling custom profiling and trace collection in Chrome.
 *
 * @class
 * @hideconstructor
 */
export class ChromeTrace {
  constructor(engineDelegate, index, options, result) {
    /**
     * @private
     */
    this.engineDelegate = engineDelegate;
    /**
     * @private
     */
    this.options = options;
    /**
     * @private
     */
    this.result = result;
    /**
     * @private
     */
    this.index = index;
  }

  /**
   * Starts the Chrome trace collection.
   *
   * @async
   * @example await commands.trace.start();
   * @returns {Promise<void>} A promise that resolves when tracing is started.
   * @throws {Error} Throws an error if not running Chrome or if configuration is not set for custom tracing.
   */
  async start() {
    if (this.options.browser === 'chrome') {
      if (this.options.chrome.timelineRecordingType === 'custom') {
        return this.engineDelegate.getCDPClient().startTrace();
      } else {
        log.info(
          'You need to set traceRecordingType to custom to turn on the profiler in scripting'
        );
      }
    } else {
      throw new Error('Trace only works in Chrome');
    }
  }

  /**
   * Stops the Chrome trace collection, processes the collected data, and attaches it to the result object.
   *
   * @async
   * @example await commands.trace.stop();
   * @returns {Promise<void>} A promise that resolves when tracing is stopped and data is processed.
   * @throws {Error} Throws an error if not running Chrome or if custom tracing was not started.
   */
  async stop() {
    if (this.options.browser === 'chrome') {
      if (this.options.chrome.timelineRecordingType === 'custom') {
        let result = this.result[0];

        this.events = [];
        this.events = await this.engineDelegate.getCDPClient().stopTrace();
        const trace = parse(this.events, result.url);
        const name = this.options.enableProfileRun
          ? `trace-${this.index}-extra-run.json`
          : `trace-${this.index}.json`;
        result.extraJson[name] = trace;

        const cpu = await parseCPUTrace(trace, result.url);
        result.cpu = cpu;

        // Collect render blocking info
        const render = await getRenderBlocking(trace);

        result.renderBlocking = render.renderBlocking;

        // The trace do not know about the HAR file so we cannot backfill
        /*
        if (!this.options.skipHar) {
          for (let harRequest of this.hars[this.index - 1].log.entries) {
            if (render.renderBlockingInfo[harRequest.request.url]) {
              harRequest._renderBlocking =
                render.renderBlockingInfo[harRequest.request.url];
            }
          }
          
        }*/
      }
    } else {
      throw new Error('Trace only works in Chrome');
    }
  }
}
