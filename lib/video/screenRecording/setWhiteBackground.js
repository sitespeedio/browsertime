'use strict';
const Promise = require('bluebird');
const log = require('intel');
module.exports = async function(driver) {
  // Wait for the browser to settle
  await Promise.delay(1200);
  log.debug('Change background color to white');
  await driver.executeScript('document.body.style.background = "#FFFFFF"');
};
