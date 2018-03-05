'use strict';
const Promise = require('bluebird');
module.exports = function setWhiteBackground(context) {
  // start(runner, testUrl, options, data, index) {
  return context.runWithDriver(driver => {
    return Promise.delay(1200).then(() => {
      // we are ready! Make the background white and let Browsertime do the
      // work
      return driver.executeScript('document.body.style.background = "#FFFFFF"');
    });
  });
};
