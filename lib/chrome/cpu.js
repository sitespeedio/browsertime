'use strict';

const log = require('intel').getLogger('browsertime.chrome.cpu');
const { parseObject } = require('chrome-trace');

module.exports = {
  async parseCpuTrace(tracelog) {
    try {
      const parsedTrace = parseObject(tracelog);

      let mainThread = parsedTrace.mainThread;
      // sometimes (since Chrome 70?) we miss out of the main thread
      // so then take the thread with most eventTypes
      let maxEvents = 0;
      if (mainThread === undefined) {
        for (let thread of Object.keys(parsedTrace.eventTypeTime)) {
          if (
            Object.keys(parsedTrace.eventTypeTime[thread]).length > maxEvents
          ) {
            // pick the one with most events
            mainThread = thread;
            maxEvents = Object.keys(parsedTrace.eventTypeTime[thread]).length;
          }
        }
      }

      const events = parsedTrace.eventTypeTime[mainThread];
      const categories = parsedTrace.eventCategoryTime[mainThread];
      return { categories, events };
    } catch (e) {
      log.error('Could not parse the trace log from Chrome', e);
      return {};
    }
  }
};
