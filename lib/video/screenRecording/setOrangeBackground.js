'use strict';

const log = require('intel').getLogger('browsertime.video');
const { until, By } = require('selenium-webdriver');
module.exports = async function (driver, options) {
  log.debug('Add orange color');
  // We tried other ways for Android (access an orange page)
  // That works fine ... but break scripts
  // https://github.com/sitespeedio/browsertime/issues/802

  let orangeScript = '';

  if (options.android && options.browser === 'firefox') {
    orangeScript = `
        (function() {
          // Adding this extra layer of white frame fixes
          // https://bugzilla.mozilla.org/show_bug.cgi?id=1606365
          // Not clear why it fixes this bug, looks like when
          // WebRender is enabled, orange frame isn't being
          // removed correctly if it's the only element
          // in the document.
          const white = document.createElement('div');
          white.id = 'browsertime-white';
          white.style.position = 'absolute';
          white.style.top = '0';
          white.style.left = '0';
          white.style.width = Math.max(document.documentElement.clientWidth, document.body.clientWidth) + 'px';
          white.style.height = Math.max(document.documentElement.clientHeight,document.body.clientHeight) + 'px';
          white.style.backgroundColor = 'white';
          white.style.zIndex = '2147483647';
          document.body.appendChild(white);
          document.body.style.display = '';

          const orange = document.createElement('div');
          orange.id = 'browsertime-orange';
          orange.style.position = 'absolute';
          orange.style.top = '0';
          orange.style.left = '0';
          orange.style.width = Math.max(document.documentElement.clientWidth, document.body.clientWidth) + 'px';
          orange.style.height = Math.max(document.documentElement.clientHeight,document.body.clientHeight) + 'px';
          orange.style.backgroundColor = '#DE640D';
          orange.style.zIndex = '2147483647';
          document.body.appendChild(orange);
          document.body.style.display = '';
        })();`;
  } else {
    orangeScript = `
        (function() {
          const orange = document.createElement('div');
          orange.id = 'browsertime-orange';
          orange.style.position = 'absolute';
          orange.style.top = '0';
          orange.style.left = '0';
          orange.style.width = Math.max(document.documentElement.clientWidth, document.body.clientWidth) + 'px';
          orange.style.height = Math.max(document.documentElement.clientHeight,document.body.clientHeight) + 'px';
          orange.style.backgroundColor = '#DE640D';
          orange.style.zIndex = '2147483647';
		      orange.style.pointerEvents = 'none';
          document.body.appendChild(orange);
          document.body.style.display = '';
        })();`;
  }

  await driver.executeScript(orangeScript);
  // It seems that in some cases the video do not have any orange at the start, so make sure we
  // the div orange div really exits
  return driver.wait(until.elementsLocated(By.id('browsertime-orange')));
};
