'use strict';

const log = require('intel').getLogger('browsertime.video');

module.exports = async function(driver) {
  log.debug('Add orange color');
  // We tried other ways for Android (access an orange page)
  // That works fine ... but break scripts
  // https://github.com/sitespeedio/browsertime/issues/802
  const orangeScript = `
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
        document.body.appendChild(orange);
        document.body.style.display = '';
      })();`;
  return driver.executeScript(orangeScript);
};
