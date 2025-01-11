import { createRequire } from 'node:module';
import merge from 'lodash.merge';
import { pathToFolder } from '../pathToFolder.js';
import { localTime } from '../util.js';
import { getLogger } from '@sitespeed.io/log';
const log = getLogger('browsertime');
const require = createRequire(import.meta.url);
const version = require('../../../package.json').version;
import { pick, isEmpty, getProperty } from '../../support/util.js';

function generateUniquePageId(baseId, existingIdMap) {
  let newId = baseId;
  while (existingIdMap.has(newId)) {
    newId = newId + '-1';
  }

  return newId;
}

function getDocumentRequests(entries, pageId) {
  let pageEntries = [...entries];
  if (pageId) {
    pageEntries = entries.filter(entry => entry.pageref === pageId);
  }

  const requests = [];
  let entry;

  do {
    entry = pageEntries.shift();
    requests.push(entry);
  } while (entry.response.redirectURL);

  return requests;
}

function getFinalURL(entries, pageref) {
  const requests = getDocumentRequests(entries, pageref);

  const finalEntry = requests.pop();
  return finalEntry.request.url;
}

function addExtrasToHAR(
  harPage,
  visualMetricsData,
  timings,
  cpu,
  googleWebVitals
) {
  const harPageTimings = harPage.pageTimings;

  const _visualMetrics = (harPage._visualMetrics = {});
  harPage._cpu = cpu;

  if (googleWebVitals) {
    harPage._googleWebVitals = googleWebVitals;
  }

  // We add the timings both as a hidden field and add
  // in pageTimings so we can easily show them in PerfCascade
  if (visualMetricsData) {
    const DO_NOT_INCLUDE_IN_HAR_TIMINGS = new Set([
      'VisualReadiness',
      'videoRecordingStart',
      'SpeedIndex',
      'PerceptualSpeedIndex',
      'ContentfulSpeedIndex',
      'VisualProgress',
      'ContentfulSpeedIndexProgress',
      'PerceptualSpeedIndexProgress'
    ]);

    for (let key of Object.keys(visualMetricsData)) {
      if (!DO_NOT_INCLUDE_IN_HAR_TIMINGS.has(key)) {
        harPageTimings['_' + key.charAt(0).toLowerCase() + key.slice(1)] =
          visualMetricsData[key];
        _visualMetrics[key] = visualMetricsData[key];
      } else if (!key.endsWith('Progress')) {
        _visualMetrics[key] = visualMetricsData[key];
      }
    }

    // Make the visual progress structure more JSON
    _visualMetrics.VisualProgress = jsonifyVisualProgress(
      visualMetricsData.VisualProgress
    );
  } else if (timings && timings.firstPaint) {
    // only add first paint if we don't have visual metrics
    harPageTimings._firstPaint = timings.firstPaint;
  }

  /*
  if (cpu && cpu.longTasks && cpu.longTasks.lastLongTask) {
    harPageTimings._lastCPULongTask = cpu.longTasks.lastLongTask;
  }
  */

  if (timings && timings.largestContentfulPaint) {
    harPageTimings._largestContentfulPaint =
      timings.largestContentfulPaint.renderTime;
  }
  if (
    timings &&
    timings.paintTiming &&
    timings.paintTiming['first-contentful-paint']
  ) {
    harPageTimings._firstContentfulPaint =
      timings.paintTiming['first-contentful-paint'];
  }

  if (timings && timings.pageTimings) {
    harPageTimings._domInteractiveTime = timings.pageTimings.domInteractiveTime;
    harPageTimings._domContentLoadedTime =
      timings.pageTimings.domContentLoadedTime;
  }
}

function addMetaToHAR(index, harPage, url, browserScript, options) {
  const _meta = (harPage._meta = {});
  _meta.connectivity = getProperty(options, 'connectivity.profile', 'native');
  _meta.connectivity = getProperty(
    options,
    'connectivity.alias',
    _meta.connectivity
  );

  if (options.resultURL) {
    const base = options.resultURL.endsWith('/')
      ? options.resultURL
      : options.resultURL + '/';
    if (options.screenshot) {
      _meta.screenshot = `${base}${pathToFolder(url, options)}screenshots/${
        index + 1
      }/afterPageCompleteCheck.${options.screenshotParams.type}`;
    }
    if (options.video) {
      _meta.video = `${base}${pathToFolder(url, options)}video/${
        index + 1
      }.mp4`;
    }
    if (options.chrome && options.chrome.timeline) {
      _meta.timeline = `${base}${pathToFolder(url, options)}trace-${
        index + 1
      }.json.gz`;
    }
  }
  if (browserScript && browserScript.pageinfo) {
    _meta.generator = browserScript.pageinfo.generator;
  }
}

function jsonifyVisualProgress(visualProgress) {
  // Original data looks like
  //  "0=0%, 1500=81%, 1516=81%, 1533=84%, 1550=84%, 1566=84%, 1600=95%, 1683=95%, 1833=100%"
  const visualProgressJSON = {};
  for (let value of visualProgress) {
    visualProgressJSON[value.timestamp] = value.percent;
  }
  return visualProgressJSON;
}

export function addBrowser(har, name, version, comment) {
  merge(har.log, {
    browser: {
      name,
      version,
      comment
    }
  });

  if (!comment) {
    delete har.log.browser.comment;
  }

  return har;
}
export function addCreator(har, comment) {
  merge(har.log, {
    creator: {
      name: 'Browsertime',
      version: version,
      comment: comment
    }
  });

  if (!comment) {
    delete har.log.creator.comment;
  }

  return har;
}
export function getMainDocumentTimings(har) {
  const timings = [];
  const entries = [...har.log.entries];

  for (let page of har.log.pages) {
    const pageId = page.id;
    const url = page._url;

    let pageEntries = [...entries];
    const finalURL = getFinalURL(pageEntries, pageId);

    pageEntries = pageEntries.filter(
      entry => entry.pageref === pageId && entry.request.url === finalURL
    );

    timings.push({ url, timings: pageEntries[0].timings });
  }
  return timings;
}
export function getFullyLoaded(har) {
  const fullyLoaded = [];
  const entries = [...har.log.entries];

  for (let page of har.log.pages) {
    const pageStartDateTime = new Date(page.startedDateTime).getTime();
    const pageId = page.id;
    const url = page._url;

    let pageEntries = [...entries];
    pageEntries = pageEntries.filter(entry => entry.pageref === pageId);

    let pageEnd = 0;
    for (let entry of pageEntries) {
      let entryEnd =
        new Date(entry.startedDateTime).getTime() +
        entry.time -
        new Date(pageStartDateTime).getTime();
      if (entryEnd > pageEnd) {
        pageEnd = entryEnd;
      }
    }
    fullyLoaded.push({ url, fullyLoaded: Number(pageEnd.toFixed(0)) });
  }
  return fullyLoaded;
}
export function mergeHars(hars) {
  if (isEmpty(hars)) {
    return;
  }
  if (hars.length === 1) {
    return hars[0];
  }
  let firstLog = hars[0].log;
  let combinedHar = {
    log: pick(firstLog, ['version', 'creator', 'browser', 'comment'])
  };
  let pagesById = new Map();
  let allEntries = [];

  for (const har of hars) {
    let pages = har.log.pages;
    let entries = har.log.entries;
    for (const page of pages) {
      let pageId = page.id;
      if (pagesById.has(pageId)) {
        const oldPageId = pageId;
        pageId = generateUniquePageId(oldPageId, pagesById);
        page.id = pageId;
        entries = entries.map(entry => {
          if (entry.pageref === oldPageId) {
            entry.pageref = pageId;
          }
          return entry;
        });
      }
      pagesById.set(pageId, page);
    }
    allEntries = [...allEntries, ...entries];
  }

  combinedHar.log.pages = [...pagesById.values()];
  combinedHar.log.entries = allEntries;

  return combinedHar;
}
export function getEmptyHAR(url, browser) {
  return {
    log: {
      version: '1.2',
      creator: {
        name: 'Browsertime',
        version: version,
        comment: ''
      },
      browser: {
        name: browser,
        version: ''
      },
      pages: [
        {
          startedDateTime: localTime(),
          id: 'failing_page',
          title: url,
          pageTimings: {},
          comment: ''
        }
      ],
      entries: [],
      comment: ''
    }
  };
}
export function addExtraFieldsToHar(totalResults, har, options) {
  if (har) {
    let harPageNumber = 0;
    // We test one page
    // Let's do a better fix for this later on
    // right now this fixes https://github.com/sitespeedio/browsertime/issues/754
    if (har.log.pages.length === options.iterations) {
      for (let harPage of har.log.pages) {
        let pageNumber = harPageNumber % totalResults.length;
        const visualMetric =
          totalResults[pageNumber].visualMetrics[harPageNumber];
        const browserScript =
          totalResults[pageNumber].browserScripts[harPageNumber];
        const cpu = totalResults[pageNumber].cpu[harPageNumber];
        const googleWebVitals =
          totalResults[pageNumber].googleWebVitals[harPageNumber];

        addMetaToHAR(
          harPageNumber,
          harPage,
          totalResults[pageNumber].info.url,
          browserScript,
          options
        );

        if (browserScript) {
          addExtrasToHAR(
            harPage,
            visualMetric,
            browserScript.timings,
            cpu,
            googleWebVitals
          );
        }
        harPageNumber++;
      }
    } else {
      const numberOfPages = totalResults.length;
      for (let page = 0; page < numberOfPages; page++) {
        for (let iteration = 0; iteration < options.iterations; iteration++) {
          let harIndex = iteration * totalResults.length;
          harIndex += page;

          const visualMetric = totalResults[page].visualMetrics[iteration];
          const browserScript = totalResults[page].browserScripts[iteration];
          const cpu = totalResults[page].cpu[iteration];
          const googleWebVitals = totalResults[page].googleWebVitals[iteration];
          const harPage = har.log.pages[harIndex];
          // Only add meta if we have a HAR
          if (harPage) {
            addMetaToHAR(
              iteration,
              harPage,
              totalResults[page].info.url,
              browserScript,
              options
            );
          } else {
            log.error(
              'Could not add meta data to the HAR, miss page ' + harIndex
            );
          }
          // Only add the metrics if we was able to collect the metrics and have a HAR
          if (browserScript && harPage) {
            addExtrasToHAR(
              harPage,
              visualMetric,
              browserScript.timings,
              cpu,
              googleWebVitals
            );
          }
        }
      }
    }
  }
}
