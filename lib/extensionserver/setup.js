'use strict';

const Promise = require('bluebird');
const util = require('../support/util');
const urlParser = require('url');
const log = require('intel');
const { isAndroidConfigured } = require('../android');

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

  if (isAndroidConfigured(options)) {
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

module.exports = async function(url, driver, port, options) {
  const configUrl = generateURL(port, url, options);
  log.debug('Configuring browser plugin via %s', configUrl);
  await driver.get(configUrl);
  await Promise.delay(500);
};
