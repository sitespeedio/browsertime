'use strict';
const log = require('intel');
const delay = ms => new Promise(res => setTimeout(res, ms));
module.exports = async function(driver) {
  // For Windows Recorder
  log.info('Change Window Title For Test On Windows');
  await driver.executeScript(
      "document.title = 'SiteSpeed'"
  );
  await delay(2000);
};
