'use strict';

const log = require('intel').getLogger('browsertime');
const delay = ms => new Promise(res => setTimeout(res, ms));

module.exports = async function (browser, options) {
  log.info('Accessing preURL %s', options.preURL);
  await browser.loadAndWait(options.preURL);
  if (!options.preURLDisableWhiteBackground) {
    await browser.runScript(
      'document.body.innerHTML = ""; document.body.style.backgroundColor = "white";',
      'WHITE_BACKGROUND'
    );
  }

  return delay(options.preURLDelay ? options.preURLDelay : 1500);
};
