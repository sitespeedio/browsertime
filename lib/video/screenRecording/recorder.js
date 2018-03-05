'use strict';
const get = require('lodash.get');
const AndroidRecorder = require('./android/recorder');
const X11Recorder = require('./desktop/x11recorder');

module.exports = function getRecorder(options) {
  const isAndroid = get(options, 'chrome.android.package', false);
  if (isAndroid) {
    return new AndroidRecorder(options);
  } else {
    return new X11Recorder(options);
  }
};
