'use strict';
const { isAndroidConfigured } = require('../../android');
const AndroidRecorder = require('./android/recorder');
const X11Recorder = require('./desktop/x11recorder');
const gdiRecorder = require('./desktop/gdiRecorder');

module.exports = function getRecorder(options) {
  if (isAndroidConfigured(options)) {
    return new AndroidRecorder(options);
  } else {
    if (process.platform === 'win32') {
      return new gdiRecorder(options);
    } else {
      return new X11Recorder(options);
    }
  }
};
