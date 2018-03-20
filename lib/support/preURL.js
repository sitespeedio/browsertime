'use strict';

const Promise = require('bluebird'),
  log = require('intel');

module.exports = async function(browser, options) {
  log.info('Accessing preURL %s', options.preURL);
  await browser.loadAndWait(options.preURL);
  await Promise.delay(options.preURLDelay ? options.preURLDelay : 1500);
};
