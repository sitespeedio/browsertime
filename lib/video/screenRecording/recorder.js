'use strict';
const { isAndroidConfigured } = require('../../android');
const AndroidRecorder = require('./android/recorder');
const X11Recorder = require('./desktop/x11recorder');

module.exports = function getRecorder(options) {
  if (isAndroidConfigured(options)) {
    return new AndroidRecorder(options);
  } else {
    return new X11Recorder(options);
  }
};
