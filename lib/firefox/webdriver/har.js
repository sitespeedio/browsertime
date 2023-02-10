/* Copyright 2023 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const HAR_VERSION = '1.2';
const BROWSER_NAME = 'Firefox';
const BROWSER_VERSION = '111.0a1';

function parseQueryString(url) {
  try {
    const urlObject = new URL(url);
    return [...urlObject.searchParams.entries()].map(([name, value]) => {
      return {
        name: decodeURIComponent(name),
        value: decodeURIComponent(value)
      };
    });
  } catch (error) {
    console.error('Failed to parse query string for url', url);
    console.error(error);
    return [];
  }
}

function getBrowser() {
  const name = BROWSER_NAME;
  const version = BROWSER_VERSION;
  return { name, version };
}

function getCreator() {
  const name = BROWSER_NAME;
  const version = BROWSER_VERSION;
  return { name, version };
}

function getHAREntry(networkEntry) {
  const harEntry = {};

  // Most of the default values (eg "?" or -1 or []) are needed for cached
  // responses which currently don't come with enough information.
  // See https://bugzilla.mozilla.org/show_bug.cgi?id=1806802
  harEntry.request = {
    bodySize: networkEntry.request.bodySize,
    method: networkEntry.request.method,
    url: networkEntry.request.url,
    httpVersion: networkEntry.response.protocol || '?',
    headers: networkEntry.request.headers,
    cookies: networkEntry.request.cookies,
    queryString: parseQueryString(networkEntry.request.url) || [],
    headersSize: networkEntry.request.headersSize
  };

  const timings = networkEntry.request.timings;
  harEntry.startedTime = timings.requestTime / 1000;
  harEntry.startedDateTime = new Date(harEntry.startedTime).toISOString();
  harEntry.response = {
    status: networkEntry.response.status || -1,
    statusText: networkEntry.response.statusText || '?',
    httpVersion: networkEntry.response.protocol || '?',
    headers: networkEntry.response.headers || [],
    cookies: [],
    content: {
      mimeType: networkEntry.response.mimeType || '?',
      size: networkEntry.response.content.size,
      encoding: '',
      text: '',
      comment: '',
      compression: ''
    },
    redirectURL: '',
    headersSize: networkEntry.response.headersSize,
    bodySize: networkEntry.response.bytesReceived
  };

  // XXX: Check where this comes from in devtools.
  harEntry.cache = {};
  harEntry.timings = {};

  // Convert from BiDi timings to HAR timings
  let last = timings.requestTime;
  harEntry.timings.blocked = (timings.dnsStart - last) / 1000;

  last = timings.dnsStart || last;
  harEntry.timings.dns = (timings.dnsEnd - timings.dnsStart) / 1000;

  last = timings.connectStart || last;
  harEntry.timings.connect = (timings.connectEnd - last) / 1000;

  last = timings.tlsStart || last;
  harEntry.timings.ssl = (timings.tlsEnd - last) / 1000;

  last = timings.tlsEnd || last;
  harEntry.timings.send = (timings.requestStart - last) / 1000;

  last = timings.requestStart || last;
  harEntry.timings.wait = (timings.responseStart - last) / 1000;

  last = timings.responseStart || last;
  harEntry.timings.receive = (timings.responseEnd - last) / 1000;

  let time = 0;
  for (const key of Object.keys(harEntry.timings)) {
    harEntry.timings[key] = Math.max(0, harEntry.timings[key]);
    time += harEntry.timings[key];
  }

  harEntry.time = time;
  return harEntry;
}

export function exportAsHAR(networkEntries, pageTimings) {
  const recording = {
    log: {
      version: HAR_VERSION,
      creator: getCreator(),
      browser: getBrowser(),
      pages: [],
      entries: []
    }
  };

  const pages = [];
  for (const pageTiming of pageTimings) {
    // Check if there is already a page item in this recording for the same URL.
    // Also exclude page entries which already have a timing corresponding to
    // the type ("load", "domContentLoaded"...), which would indicate another
    // navigation to the same URL.
    let page = pages.find(
      p => p.url === pageTiming.url && !p.pageTimings[pageTiming.type]
    );
    if (!page) {
      // Create a base page record.
      page = {
        id: `page_${pages.length + 1}`,
        pageTimings: {},
        startedDateTime: new Date(pageTiming.startedTime).toISOString(),
        title: pageTiming.url,
        // startedTime and url are temporary properties, and will be deleted
        // before generating the HAR.
        startedTime: pageTiming.startedTime,
        url: pageTiming.url
      };
      pages.push(page);
    }

    // Add the timing, which is the relative time for either DOMContentLoaded or Load
    page.pageTimings[pageTiming.type] = pageTiming.relativeTime;
  }

  recording.log.pages = pages;

  for (const networkEntry of networkEntries) {
    if (!networkEntry.response) {
      // Redirected requests are currently not emitting the responseStarted
      // responseCompleted events because they are triggered out of order.
      // See https://bugzilla.mozilla.org/show_bug.cgi?id=1809210
      // In the meantime, ignore entries with a missing `response`.
      continue;
    }

    const entry = getHAREntry(networkEntry);
    for (const page of recording.log.pages) {
      if (page.startedTime <= entry.startedTime) {
        entry.pageref = page.id;
      }
    }
    delete entry.startedTime;
    recording.log.entries.push(entry);
  }

  for (const page of recording.log.pages) {
    // Rename timings
    page.pageTimings.onContentLoad = page.pageTimings.domContentLoaded * 1;
    page.pageTimings.onLoad = page.pageTimings.load * 1;

    // Delete temporary fields
    delete page.pageTimings.domContentLoaded;
    delete page.pageTimings.load;
    delete page.startedTime;
    delete page.url;
  }

  recording.log.entries = recording.log.entries.sort((e1, e2) => {
    return e1.request.timestamp - e2.request.timestamp;
  });

  return recording;
}
