'use strict';

const execa = require('execa'),
  log = require('intel'),
  get = require('lodash.get'),
  path = require('path');

const SCRIPT_PATH = path.join(__dirname, '..', '..', '..', 'vendor', 'visualmetrics.py');

module.exports = {
  checkDependencies() {
    return execa(SCRIPT_PATH, ['--check']);
  },
  run(videoPath, imageDirPath, options) {
    const runOnAndroid = get(options, 'chrome.android.package', false);
    const mobileEmulation = get(options, 'chrome.mobileEmulation.deviceName', false);

    const scriptArgs = [
      '--video', videoPath,
      '--orange',
      '-q', 75,
      '--perceptual',
      '--force',
      '--renderignore',
      5,
      '--json'];

    if (runOnAndroid) {
      scriptArgs.push('--viewport');
    }
    // to remove those gray frames that started to appear in Chrome 58
    if (mobileEmulation) {
      scriptArgs.push('--gray');
    }
    if (imageDirPath) {
      scriptArgs.unshift('--dir', imageDirPath);
    }

    log.verbose('Running visualmetrics.py ' + scriptArgs.join(' '));

    return execa(SCRIPT_PATH, scriptArgs)
      .then((result) => JSON.parse(result.stdout));
  }
};
