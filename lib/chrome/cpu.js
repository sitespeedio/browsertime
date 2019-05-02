'use strict';

const log = require('intel').getLogger('browsertime.chrome.cpu');
const Tracium = require('tracium');

function round(num, decimals = 3) {
  const pow = Math.pow(10, decimals);
  return Math.round(num * pow) / pow;
}

module.exports = {
  async parseCpuTrace(tracelog) {
    try {
      const tasks = Tracium.computeMainThreadTasks(tracelog, {
        flatten: true
      });

      const categories = {
        parseHTML: 0,
        styleLayout: 0,
        paintCompositeRender: 0,
        scriptParseCompile: 0,
        scriptEvaluation: 0,
        garbageCollection: 0,
        other: 0
      };

      const events = {};
      const urls = {};

      for (const task of tasks) {
        categories[task.kind] += task.selfTime;
        if (events[task.event.name]) {
          events[task.event.name] += task.selfTime;
        } else {
          events[task.event.name] = task.selfTime;
        }

        if (task.attributableURLs && task.attributableURLs.length > 0) {
          for (let url of task.attributableURLs) {
            if (urls[url]) {
              urls[url] += task.selfTime;
            } else {
              urls[url] = task.selfTime;
            }
          }
        }
      }

      // Fix decimals
      for (let category of Object.keys(categories)) {
        categories[category] = round(categories[category], 0);
      }

      for (let event of Object.keys(events)) {
        events[event] = round(events[event]);
      }

      // Only report URLs with more than 10 ms
      const limit = 10;
      for (let url of Object.keys(urls)) {
        if (urls[url] > limit) {
          urls[url] = round(urls[url]);
        } else {
          delete urls[url];
        }
      }

      return { categories, events, urls };
    } catch (e) {
      log.error('Could not parse the trace log from Chrome', e);
      return {};
    }
  }
};
