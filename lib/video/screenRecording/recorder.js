'use strict';
const { isAndroidConfigured } = require('../../android');
const AndroidRecorder = require('./android/recorder');
const DesktopRecorder = require('./desktop/desktopRecorder');
const FirefoxWindowRecorder = require('./firefox/firefoxWindowRecorder');
const IOSSimulatorRecorder = require('./iosSimulator/recorder');

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

  if (
    options.browser === 'safari' &&
    options.safari &&
    options.safari.useSimulator
  ) {
    return new IOSSimulatorRecorder(options, baseDir);
  }

  return new DesktopRecorder(options);
};
