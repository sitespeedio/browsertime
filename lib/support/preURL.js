'use strict';

const Promise = require('bluebird'),
  log = require('intel');

module.exports = async function(driver, options) {
  log.info('Accessing preURL %s', options.preURL);
  await driver.get(options.preURL);
  await Promise.delay(options.preURLDelay ? options.preURLDelay : 1500);
};
