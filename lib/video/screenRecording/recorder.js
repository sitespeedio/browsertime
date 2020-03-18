'use strict';
const { isAndroidConfigured } = require('../../android');
const AndroidRecorder = require('./android/recorder');
const DesktopRecorder = require('./desktop/desktopRecorder');
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

  return new DesktopRecorder(options);
};
