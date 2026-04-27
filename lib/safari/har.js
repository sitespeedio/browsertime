import { harFromMessages } from 'chrome-har';
import { getLogger } from '@sitespeed.io/log';
import { cleanSensitiveHeaders } from '../support/har/index.js';

const log = getLogger('browsertime.safari.har');

export async function getHar(
  adapter,
  result,
  index,
  inspectorClient,
  includeResponseBodies,
  aliasAndUrl,
  cleanHeaders
) {
  const messages = adapter.getMessages();

  let har;
  try {
    har = harFromMessages(messages);
  } catch (error) {
    log.error('Failed to generate HAR from messages: %s', error.message);
    log.verbose(error);
    return getEmptyHar();
  }

  // Fix timing values and remove cached entries without timing data
  har.log.entries = har.log.entries.filter(entry => {
    // Remove entries without _requestTime — these are cached resources
    // that WebKit reported but have no useful timing data
    const noTiming =
      entry._requestTime === undefined || entry._requestTime === 0;
    if (noTiming) {
      return false;
    }

    // Fix any remaining NaN/non-number timing values
    if (entry.timings) {
      for (const key of Object.keys(entry.timings)) {
        if (key === 'comment') {
          // comment must be a string per HAR spec
          if (typeof entry.timings[key] !== 'string') {
            delete entry.timings[key];
          }
        } else if (
          typeof entry.timings[key] !== 'number' ||
          !Number.isFinite(entry.timings[key])
        ) {
          entry.timings[key] = 0;
        }
      }
    }
    if (typeof entry.time !== 'number' || !Number.isFinite(entry.time)) {
      entry.time = 0;
    }
    return true;
  });

  // Add browser info
  har.log.creator = {
    name: 'Browsertime',
    version: '1.0'
  };
  har.log.browser = {
    name: 'Safari',
    version: ''
  };

  // Clean sensitive headers if requested
  if (cleanHeaders === true) {
    for (const entry of har.log.entries ?? []) {
      for (const header of entry.request?.headers ?? []) {
        header.value = cleanSensitiveHeaders(header.name, header.value);
      }
      for (const header of entry.response?.headers ?? []) {
        header.value = cleanSensitiveHeaders(header.name, header.value);
      }
    }
  }

  // Handle response bodies
  if (
    inspectorClient &&
    (includeResponseBodies === 'html' || includeResponseBodies === 'all')
  ) {
    for (const entry of har.log.entries) {
      if (
        includeResponseBodies === 'html' &&
        !entry.response.content.mimeType?.includes('text/html')
      ) {
        continue;
      }
      try {
        const response = await inspectorClient.send('Network.getResponseBody', {
          requestId: entry._requestId
        });
        if (response?.result?.body) {
          entry.response.content.text = response.result.body;
          if (response.result.base64Encoded) {
            entry.response.content.encoding = 'base64';
          }
        }
      } catch {
        log.debug('Could not get response body for %s', entry.request.url);
      }
    }
  }

  // Set page title and URL
  if (har.log.pages.length > 0) {
    const url = result.url || '';
    har.log.pages[0].title = `${url} run ${index}`;
    const alias = aliasAndUrl[url] || url;
    har.log.pages[0]._url = url;
    har.log.pages[0]._alias = alias;
  }

  return har;
}

function getEmptyHar() {
  return {
    log: {
      version: '1.2',
      creator: { name: 'Browsertime', version: '1.0' },
      browser: { name: 'Safari', version: '' },
      pages: [],
      entries: []
    }
  };
}
