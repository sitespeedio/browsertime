'use strict';
const log = require('intel').getLogger('browsertime.video');
const { isAndroidConfigured } = require('../../android');
module.exports = async function(driver, options) {
  log.debug('Add orange color');
  if (isAndroidConfigured(options)) {
    // base 64 encoded page that creates an orange background that gets unloaded on unload
    return driver.get(
      'data:text/html;base64,PGh0bWw+CjxoZWFkPgo8c3R5bGU+CmJvZHkge2JhY2tncm91bmQtY29sb3I6IHdoaXRlOyBtYXJnaW46IDA7fQojYW5kcm9pZCB7d2lkdGg6MTAwJTsgaGVpZ2h0OiAxMDAlOyBiYWNrZ3JvdW5kLWNvbG9yOiAjREU2NDBEO30KPC9zdHlsZT4KPHNjcmlwdD4Kd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2JlZm9yZXVubG9hZCcsIGZ1bmN0aW9uKCkgewogIGNvbnN0IGFuZHJvaWQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYW5kcm9pZCcpCiAgYW5kcm9pZC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGFuZHJvaWQpOwp9KTsKPC9zY3JpcHQ+CjwvaGVhZD4KPGJvZHk+PGRpdiBpZD0nYW5kcm9pZCc+PC9kaXY+PC9ib2R5Pgo8L2h0bWw+Cg=='
    );
  } else {
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
      })();`;
    return driver.executeScript(orangeScript);
  }
};
