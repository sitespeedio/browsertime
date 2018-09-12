'use strict';
const log = require('intel').getLogger('browsertime.video');
const delay = ms => new Promise(res => setTimeout(res, ms));
module.exports = async function(driver) {
  // start on a blank page and lets make the background orange
  // that will make it easier for VisualMetrics to know when the
  // page is requested
  log.debug('Change background color to orange');
  await delay(1000);
  return driver.executeScript(
    'document.body.innerHTML = ""; document.body.style.background = "#DE640D";'
  );
};
