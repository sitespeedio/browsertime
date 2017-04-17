'use strict';

const Promise = require('bluebird');
const util = require('./util');
const urlParser = require('url');
const log = require('intel');

function generateURL(port, options) {
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

  return urlParser.format({
    protocol: 'http',
    hostname: '127.0.0.1',
    port,
    query
  });
}

module.exports = function createPreTask(port) {
  return {
    run(context) {
      return context.runWithDriver((driver) => {
        const url = generateURL(port, context.options);
        log.debug('Configuring browser plugin via %s', url);
        return driver.get(url);
      }).then(() => Promise.delay(500));
    }
  }
};
