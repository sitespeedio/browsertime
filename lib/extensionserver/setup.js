'use strict';

const Promise = require('bluebird');
const util = require('../support/util');
const urlParser = require('url');
const get = require('lodash.get');
const log = require('intel');

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
  const testOnAndroid = get(options, 'chrome.android.package', false);

  if (!testOnAndroid) {
    return urlParser.format({
      protocol: 'http',
      hostname: '127.0.0.1',
      port,
      query
    });
  } else {
    return urlParser.format({
      protocol: 'https',
      hostname: 'www.example.com',
      port: 443,
      query
    });
  }
}

module.exports = async function(url, driver, port, options) {
  const configUrl = generateURL(port, url, options);
  log.debug('Configuring browser plugin via %s', configUrl);
  await driver.get(configUrl);
  await Promise.delay(500);
};
