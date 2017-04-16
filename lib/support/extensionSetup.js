'use strict';

const Promise = require('bluebird'),
  util = require('./util'),
  querystring = require('querystring'),
  log = require('intel');


function generateURL(options) {
  const localServer = 'http://127.0.0.1:8081/'
  let parameters = {};
  if (options.block) {
    parameters.bl = util.toArray(options.block);
  }
  if (options.requestheader) {
    parameters.rh = util.toArray(options.requestheader);
  }
  if (options.cacheClearRaw) {
    parameters.clear = 'true';
  }

  return localServer + '?' + querystring.stringify(parameters);
}

module.exports = {
  run(context) {
    return context.runWithDriver((driver) => {
      log.info('Set up extension');
      return driver.get(generateURL(context.options));
    }).then(() => Promise.delay(500));
  }
};
