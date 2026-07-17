import { getLogger } from '@sitespeed.io/log';
import {
  computeMainThreadTasks,
  computeScriptCosts,
  computeForcedReflows,
  computeNonCompositedAnimations,
  computeBlockingTime,
  computeDomainBreakdown,
  computeFrameStability,
  computeStyleInvalidations,
  computeSelectorStats
} from './trace/index.js';
import { labelForUrl } from './mediawikiResourceLoader.js';
const log = getLogger('browsertime.chrome.cpu');

// Additive label field for MediaWiki ResourceLoader URLs so per-bundle
// time series survive the weekly version= churn. The url field is
// untouched (browsertime.json shape is a public contract); non-MediaWiki
// URLs get no label and the output stays byte-identical to before.
function addResourceLoaderLabels(entries, urlField = 'url', field = 'label') {
  for (const entry of entries) {
    const label = labelForUrl(entry[urlField]);
    if (label) entry[field] = label;
  }
}

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

    // New analyses derived from the same trace. Each is independent
    // of the others and won't produce noise on pages where the
    // signal isn't present (empty arrays). Wrapped in a try so a
    // bug in one analysis can't poison the existing categories /
    // events / urls payload.
    let scriptCosts = [];
    let forcedReflows = [];
    let nonCompositedAnimations = [];
    try {
      scriptCosts = computeScriptCosts(tracelog);
    } catch (error) {
      log.debug('computeScriptCosts failed: %s', error.message);
    }
    try {
      forcedReflows = computeForcedReflows(tracelog);
    } catch (error) {
      log.debug('computeForcedReflows failed: %s', error.message);
    }
    try {
      nonCompositedAnimations = computeNonCompositedAnimations(tracelog);
    } catch (error) {
      log.debug('computeNonCompositedAnimations failed: %s', error.message);
    }
    // These return objects with summary totals, so on failure the
    // key is omitted instead of publishing a misleading zero total.
    let blocking;
    try {
      blocking = computeBlockingTime(tracelog);
    } catch (error) {
      log.debug('computeBlockingTime failed: %s', error.message);
    }
    let domains;
    try {
      domains = computeDomainBreakdown(tracelog, url);
    } catch (error) {
      log.debug('computeDomainBreakdown failed: %s', error.message);
    }
    let frames;
    try {
      frames = computeFrameStability(tracelog);
    } catch (error) {
      log.debug('computeFrameStability failed: %s', error.message);
    }
    let styleInvalidations;
    try {
      styleInvalidations = computeStyleInvalidations(tracelog);
    } catch (error) {
      log.debug('computeStyleInvalidations failed: %s', error.message);
    }
    // Only produces output when the SelectorStats trace category is
    // on (--enableProfileRun); undefined omits the key.
    let selectorStats;
    try {
      selectorStats = computeSelectorStats(tracelog);
    } catch (error) {
      log.debug('computeSelectorStats failed: %s', error.message);
    }

    addResourceLoaderLabels(cleanedUrls);
    addResourceLoaderLabels(scriptCosts);
    addResourceLoaderLabels(
      forcedReflows,
      'triggeredByUrl',
      'triggeredByUrlLabel'
    );
    if (blocking) {
      addResourceLoaderLabels(blocking.urls);
      if (blocking.beforeLargestContentfulPaint) {
        addResourceLoaderLabels(blocking.beforeLargestContentfulPaint.urls);
      }
    }
    if (styleInvalidations) {
      addResourceLoaderLabels(styleInvalidations.sources);
    }

    log.debug('Chrome trace log finished parsed and sorted.');
    return {
      categories,
      events,
      urls: cleanedUrls,
      scriptCosts,
      forcedReflows,
      nonCompositedAnimations,
      ...(blocking ? { blocking } : {}),
      ...(domains ? { domains } : {}),
      ...(frames ? { frames } : {}),
      ...(styleInvalidations ? { styleInvalidations } : {}),
      ...(selectorStats ? { selectorStats } : {})
    };
  } catch (error) {
    log.error(
      'Could not parse the trace log from Chrome for url %s',
      url,
      error
    );
    return {};
  }
}
