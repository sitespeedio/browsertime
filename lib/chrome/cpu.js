'use strict';

const { parseObject } = require('chrome-trace');

module.exports = {
  async parseCpuTrace(tracelog) {
    const parsedTrace = parseObject(tracelog);

    const mainThread = parsedTrace.mainThread;
    const events = parsedTrace.eventTypeTime[mainThread];
    const categories = parsedTrace.eventCategoryTime[mainThread];

    return { categories, events };
  }
};
