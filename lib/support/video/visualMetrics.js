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
    // The Chrome "blink": sometimes recording a video of the Chrome screen
    // generates 1/2 or 1/4 orange screens and to make sure they aren't picked
    // up by VisualMetrics we set another value that defines the diff.
    const orangelimitdiff = options.browser === 'chrome' ? 39900 : 20000;

    const runOnAndroid = get(options, 'chrome.android.package', false);

    const scriptArgs = [
      '--video', videoPath,
      '--orange',
      '-q', 75,
      '--perceptual',
      '--force',
      '--renderignore',
      5,
      '--orangelimitdiff',
      orangelimitdiff,
      '--json'];

      if (runOnAndroid) {
        scriptArgs.push('--viewport');
      }

    if (imageDirPath) {
      scriptArgs.unshift('--dir', imageDirPath);
    }

    log.verbose('Running visualmetrics.py ' + scriptArgs.join(' '));

    return execa(SCRIPT_PATH, scriptArgs)
      .then((result) => JSON.parse(result.stdout));
  }
};
