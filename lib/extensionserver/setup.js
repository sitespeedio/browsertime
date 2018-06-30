'use strict';
const util = require('../support/util');
const urlParser = require('url');
const log = require('intel');
const { isAndroidConfigured } = require('../android');
const delay = ms => new Promise(res => setTimeout(res, ms));

function generateURL(port, testUrl, options) {
  const query = {};
  if (options.block) {
    query.bl = util.toArray(options.block);
  }
  if (options.requestheader) {
    query.rh = util.toArray(options.requestheader);
  }
  if (options.cacheClearRaw) {
    query.clear = 'true';
  }

  if (options.basicAuth) {
    query.ba = options.basicAuth + '@' + testUrl;
  }

  if (options.cookie) {
    const name = options.cookie.substring(0, options.cookie.indexOf('='));
    const value = options.cookie.substring(options.cookie.indexOf('=') + 1);

    console.log('name:' + name);
    console.log('value:' + value);
    query.cookie = name + '@' + value + '@' + testUrl;
  }

  if (isAndroidConfigured(options) || options.android) {
    return urlParser.format({
      protocol: 'https',
      hostname: 'www.example.com',
      port: 443,
      query
    });
  } else {
    return urlParser.format({
      protocol: 'http',
      hostname: '127.0.0.1',
      port,
      query
    });
  }
}

module.exports = async function(url, browser, port, options) {
  const configUrl = generateURL(port, url, options);
  log.debug('Configuring browser plugin via %s', configUrl);
  await browser.loadAndWait(configUrl);
  // Add some time to make sure the cache is cleared etc
  await delay(500);
};
