import { getLogger } from '@sitespeed.io/log';
import { computeMainThreadTasks } from '@sitespeed.io/tracium';
const log = getLogger('browsertime.chrome.cpu');

function round(number_, decimals = 3) {
  const pow = Math.pow(10, decimals);
  return Math.round(number_ * pow) / pow;
}

function slowestFirst(a, b) {
  return b.value - a.value;
}

export async function parseCPUTrace(tracelog, url) {
  try {
    log.debug('Start parse Chrome trace log using Tracium.');
    const tasks = computeMainThreadTasks(tracelog, {
      flatten: true
    });
    log.debug('Finished parsing the trace log using Tracium.');

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

    // Only report events with more than 10 ms
    const eventLimit = 10;
    for (let event of Object.keys(events)) {
      if (events[event] > eventLimit) {
        events[event] = round(events[event]);
      } else {
        delete events[event];
      }
    }

    // Only report URLs with more than 10 ms
    const limit = 10;
    const cleanedUrls = [];
    for (let url of Object.keys(urls)) {
      if (urls[url] > limit) {
        cleanedUrls.push({ url, value: round(urls[url]) });
      }
    }

    cleanedUrls.sort(slowestFirst);

    log.debug('Chrome trace log finished parsed and sorted.');
    return { categories, events, urls: cleanedUrls };
  } catch (error) {
    log.error(
      'Could not parse the trace log from Chrome for url %s',
      url,
      error
    );
    return {};
  }
}
