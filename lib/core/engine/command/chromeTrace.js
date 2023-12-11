import intel from 'intel';

import { getRenderBlocking } from '../../../chrome/webdriver/traceUtilities.js';
import { parse } from '../../../chrome/traceCategoriesParser.js';
import { parseCPUTrace } from '../../../chrome/parseCpuTrace.js';
const log = intel.getLogger('browsertime.command.chrometrace');
export class ChromeTrace {
  constructor(engineDelegate, index, options, result) {
    this.engineDelegate = engineDelegate;
    this.options = options;
    this.result = result;
    this.index = index;
  }

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
