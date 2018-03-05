'use strict';

const Promise = require('bluebird');
const log = require('intel');
module.exports = async function(context) {
  // start(runner, testUrl, options, data, index) {
  return context.runWithDriver(driver => {
    // start on a blank page and lets make the background orange
    // that will make it easier for VisualMetrics to know when the
    // page is requested
    log.debug('Change background color to orange');
    return Promise.delay(1000).then(() =>
      driver.executeScript('document.body.style.background = "#DE640D"')
    );
  });
};
