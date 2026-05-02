import { getLogger } from '@sitespeed.io/log';
import { harFromMessages } from 'chrome-har';
import { logging } from 'selenium-webdriver';
const log = getLogger('browsertime.chrome');
import { addBrowser, cleanSensitiveHeaders } from '../support/har/index.js';
const { Type } = logging;

export async function getHar(
  runner,
  result,
  index,
  cdpClient,
  logPerfEntries,
  includeResponseBodies,
  mobileEmulation,
  androidClient,
  chrome,
  aliasAndUrl,
  cleanHeaders
) {
  log.debug('Getting performance logs from Chrome');

  const logs = await runner.getLogs(Type.PERFORMANCE);
  const messages = logs.map(entry => JSON.parse(entry.message).message);

  // Inject a SoftNavigation.detected event so chrome-har emits/renames a
  // HAR page for this measurement. Chrome's PerformanceObserver
  // soft-navigation entry is the trustworthy signal (user interaction +
  // URL change + visible paint), but it doesn't always fire — Grafana and
  // similar SPAs can defer their post-route paint past Chrome's window —
  // so when this measurement was started without a URL (the
  // `commands.measure.start(alias)` form, signalling "the next page is a
  // soft-navigation I'm about to drive") we fall back to the current
  // location.href. Without the fallback, chrome-har silently emits zero
  // pages for that measurement and downstream consumers (sitespeed.io's
  // per-iteration page indexing) drift out of alignment.
  try {
    const softNavEntries = await runner.runScript(
      `const supported = PerformanceObserver.supportedEntryTypes;
       if (!supported || supported.indexOf('soft-navigation') === -1) return [];
       const startIndex = window.__bt_softNavCount || 0;
       const entries = performance.getEntriesByType('soft-navigation').slice(startIndex);
       if (entries.length === 0) return [];
       const last = entries[entries.length - 1];
       return [{ url: last.name, startTime: last.startTime }];`,
      'GET_SOFT_NAVIGATIONS_FOR_HAR'
    );
    if (softNavEntries && softNavEntries.length > 0) {
      const entry = softNavEntries[0];
      messages.push({
        method: 'SoftNavigation.detected',
        params: { url: entry.url, startTime: entry.startTime }
      });
    } else if (!result.url) {
      const fallbackUrl = await runner.runScript(
        'return window.location.href;',
        'GET_URL_FOR_HAR_FALLBACK'
      );
      if (fallbackUrl) {
        messages.push({
          method: 'SoftNavigation.detected',
          params: { url: fallbackUrl, startTime: 0 }
        });
      }
    }
  } catch {
    // Soft navigations not supported, ignore
  }

  if (logPerfEntries) {
    if (!result.extraJson) {
      result.extraJson = {};
    }
    result.extraJson[`chromePerflog-${index}.json`] = messages;
  }
  // CLEANUP since Chromedriver 2.29 there's a bug
  // https://bugs.chromium.org/p/chromedriver/issues/detail?id=1811
  await runner.getLogs(Type.PERFORMANCE);

  const har = harFromMessages(messages);

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

  if (includeResponseBodies === 'html' || includeResponseBodies === 'all') {
    await cdpClient.setResponseBodies(har);
  }

  const getVersion = await cdpClient.send('Browser.getVersion');
  const versionInfo = getVersion.product.split('/');
  const info = {
    name: versionInfo[0],
    version: versionInfo[1]
  };

  if (mobileEmulation) {
    info.name = `Chrome Emulated ${chrome.mobileEmulation.deviceName}`;
  }
  addBrowser(har, info.name, info.version);

  if (androidClient) {
    har.log._android = await androidClient.getMeta();
    har.log._android.id = androidClient.id;
  }

  if (har.log.pages.length > 0) {
    const page = har.log.pages[0];
    // For soft navigations, use the soft navigation URL as the title
    const pageUrl = page._softNavigation ? page.title : result.url;
    page.title = `${pageUrl} run ${index}`;
    // Hack to add the URL from a SPA
    if (page._softNavigation) {
      page._url = pageUrl;
    } else if (result.alias && !aliasAndUrl[result.alias]) {
      aliasAndUrl[result.alias] = result.url;
      page._url = result.url;
    } else if (result.alias && aliasAndUrl[result.alias]) {
      page._url = aliasAndUrl[result.alias];
    } else {
      page._url = result.url;
    }
  }
  return har;
}
