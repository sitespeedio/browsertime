'use strict';

const log = require('intel').getLogger('browsertime');
const delay = ms => new Promise(res => setTimeout(res, ms));

module.exports = async function(browser, options) {
  log.info('Accessing preURL %s', options.preURL);
  await browser.loadAndWait(options.preURL);
  await delay(options.preURLDelay ? options.preURLDelay : 1500);
};
