'use strict';

const { parseObject } = require('chrome-trace');

module.exports = {
  async parseCpuTrace(tracelog) {
    const parsedTrace = parseObject(tracelog);

    let mainThread = parsedTrace.mainThread;
    // sometimes (since Chrome 70?) we miss out of the main thread
    // so then take the thread with most eventTypes
    let maxEvents = 0;
    if (mainThread === undefined) {
      for (let thread of Object.keys(parsedTrace.eventTypeTime)) {
        if (Object.keys(parsedTrace.eventTypeTime[thread]).length > maxEvents) {
          // pick the one with most events
          mainThread = thread;
          maxEvents = Object.keys(parsedTrace.eventTypeTime[thread]).length;
        }
      }
    }

    const events = parsedTrace.eventTypeTime[mainThread];
    const categories = parsedTrace.eventCategoryTime[mainThread];

    return { categories, events };
  }
};
