'use strict';
const { isAndroidConfigured } = require('../../android');
const AndroidRecorder = require('./android/recorder');
const X11Recorder = require('./desktop/x11recorder');
const FirefoxWindowRecorder = require('./firefox/firefoxWindowRecorder');

module.exports = function getRecorder(options, browser, baseDir) {
  if (
    options.browser === 'firefox' &&
    options.firefox &&
    options.firefox.windowRecorder
  ) {
    return new FirefoxWindowRecorder(options, browser, baseDir);
  }

  if (isAndroidConfigured(options)) {
    return new AndroidRecorder(options);
  }

  return new X11Recorder(options);
};
