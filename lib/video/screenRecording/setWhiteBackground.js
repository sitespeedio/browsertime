'use strict';
const Promise = require('bluebird');
const log = require('intel');
module.exports = async function(context) {
  // start(runner, testUrl, options, data, index) {
  return context.runWithDriver(driver => {
    return Promise.delay(1200).then(() => {
      // we are ready! Make the background white and let Browsertime do the
      // work
      log.debug('Change background color to white');
      return driver.executeScript('document.body.style.background = "#FFFFFF"');
    });
  });
};
