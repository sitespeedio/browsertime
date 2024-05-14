import { format } from 'node:url';
import intel from 'intel';
import { toArray } from '../support/util.js';
const log = intel.getLogger('browsertime');
const delay = ms => new Promise(res => setTimeout(res, ms));

function generateURL(port, testUrl, options) {
  const query = {};
  if (options.requestheader) {
    query.rh = toArray(options.requestheader);
  }
  if (options.cacheClearRaw) {
    query.clear = 'true';
  }

  if (options.clearCacheKeepCookies) {
    query.clearCacheKeepCookies = 'true';
  }

  if (options.basicAuth) {
    query.ba = options.basicAuth + '@' + testUrl;
  }

  return format({
    protocol: 'http',
    hostname: '127.0.0.1',
    port,
    query
  });
}

export async function setup(url, browser, port, options) {
  const configUrl = generateURL(port, url, options);
  log.debug('Configuring browser plugin via %s', configUrl);
  await browser.loadAndWait(configUrl);
  // Add some time to make sure the cache is cleared etc
  await delay(500);
}
