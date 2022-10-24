import { format } from 'node:url';
import intel from 'intel';
import { toArray } from '../support/util.js';
const log = intel.getLogger('browsertime');
const delay = ms => new Promise(res => setTimeout(res, ms));

function generateURL(port, testUrl, options) {
  const query = {};
  if (options.block) {
    query.bl = toArray(options.block);
  }
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

  if (options.injectJs && options.browser === 'firefox') {
    query.js = options.injectJs;
  }

  if (options.cookie) {
    const cookies = toArray(options.cookie);
    query.cookie = [];
    for (const cookie of cookies) {
      const name = cookie.slice(0, Math.max(0, cookie.indexOf('=')));
      const value = cookie.slice(Math.max(0, cookie.indexOf('=') + 1));
      query.cookie.push(name + '@' + value + '@' + testUrl);
    }
  }

  return format({
    protocol: 'http',
    hostname: '127.0.0.1',
    port,
    query
  });
}

export default async function (url, browser, port, options) {
  const configUrl = generateURL(port, url, options);
  log.debug('Configuring browser plugin via %s', configUrl);
  await browser.loadAndWait(configUrl);
  // Add some time to make sure the cache is cleared etc
  await delay(500);
}
