'use strict';
const { isAndroidConfigured } = require('../../android');
const AndroidRecorder = require('./android/recorder');
const X11Recorder = require('./desktop/x11recorder');
const FirefoxWindowRecorder = require('./firefox/firefoxWindowRecorder');
const os = require('os');

module.exports = function getRecorder(options, browser, baseDir) {
  if (isAndroidConfigured(options)) {
    return new AndroidRecorder(options);
  } else {
    if (options.firefox.windowRecorder) {
      if (options.browser === 'firefox' &&
          (os.platform() === 'win32' || os.platform() === 'linux')) {
        return new FirefoxWindowRecorder(options, browser, baseDir);
      }
      throw new Error('firefox.windowRecorder is only supported in Firefox on Windows and Linux');
    } else {
      return new X11Recorder(options);
    }
  }
};
