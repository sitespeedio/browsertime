'use strict';
const log = require('intel').getLogger('browsertime.video');
module.exports = async function(driver, browser) {
  // start on a blank page and lets make the background orange
  // that will make it easier for VisualMetrics to know when the
  // page is requested
  log.debug('Add orange color');
  // This is following the same structure as WPT to get rid of the problem
  // when testing with preScripts.
  const orangeScript =
    browser === 'chrome'
      ? `
  (function() {
    const orange = document.createElement('div');
    orange.id = 'browsertime-orange';
    orange.style.position = 'absolute';
    orange.style.top = '0';
    orange.style.left = '0';
    orange.style.width = document.documentElement.clientWidth + 'px';
    orange.style.height = document.documentElement.clientHeight + 'px';
    orange.style.backgroundColor = '#DE640D';
    orange.style.zIndex = '2147483647';
    document.body.appendChild(orange);
  })();
  `
      : `
  (function() {
    const orange = document.createElement('div');
    orange.id = 'browsertime-orange';
    orange.style.position = 'absolute';
    orange.style.top = '0';
    orange.style.left = '0';
    orange.style.width = document.body.clientWidth + 'px';
    orange.style.height = document.body.clientHeight + 'px';
    orange.style.backgroundColor = '#DE640D';
    orange.style.zIndex = '2147483647';
    document.body.appendChild(orange);
  })();
  `;
  return driver.executeScript(orangeScript);
};
