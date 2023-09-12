import intel from 'intel';

import {
  getFirstContentFulPaintEvent,
  getLargestContentfulPaintEvent,
  getRecalculateStyleElementsAndTimeBefore
} from '../../../chrome/webdriver/traceUtilities.js';
import { parse } from '../../../chrome/traceCategoriesParser.js';
import { parseCPUTrace } from '../../../chrome/parseCpuTrace.js';
const log = intel.getLogger('browsertime.command.chrometrace');
export class chromeTrace {
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
        return this.engineDelegate.getCDPClient().stopTrace();
      } else {
        log.info(
          'You need to set traceRecordingType to custom to turn on the profiler in scripting'
        );
      }
    } else {
      throw new Error('Trace only works in Chrome');
    }
  }

  async stopAndCollect() {
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
        const renderBlockingInfo = {};
        const urlsWithBlockingInfo = trace.traceEvents.filter(
          task =>
            task.cat === 'devtools.timeline' &&
            task.name === 'ResourceSendRequest' &&
            task.args.data.url &&
            task.args.data.renderBlocking
        );
        for (let asset of urlsWithBlockingInfo) {
          renderBlockingInfo[asset.args.data.url] =
            asset.args.data.renderBlocking;
        }

        const fcpEvent = getFirstContentFulPaintEvent(trace.traceEvents);
        const lcpEvent = getLargestContentfulPaintEvent(trace.traceEvents);

        result.renderBlocking = { recalculateStyle: {}, requests: {} };

        if (fcpEvent) {
          const beforeFCP = getRecalculateStyleElementsAndTimeBefore(
            trace.traceEvents,
            fcpEvent.ts
          );
          result.renderBlocking.recalculateStyle.beforeFCP = beforeFCP;
        }

        if (lcpEvent) {
          const beforeLCP = getRecalculateStyleElementsAndTimeBefore(
            trace.traceEvents,
            lcpEvent.ts
          );
          result.renderBlocking.recalculateStyle.beforeLCP = beforeLCP;
        }

        if (!this.options.skipHar) {
          for (let harRequest of this.hars[this.index - 1].log.entries) {
            if (renderBlockingInfo[harRequest.request.url]) {
              harRequest._renderBlocking =
                renderBlockingInfo[harRequest.request.url];
            }
          }
        }

        result.renderBlocking.requests = renderBlockingInfo;
      }
    } else {
      throw new Error('Trace only works in Chrome');
    }
  }
}
