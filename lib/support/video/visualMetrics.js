'use strict';

const execa = require('execa'),
  log = require('intel'),
  get = require('lodash.get'),
  path = require('path');

const SCRIPT_PATH = path.join(
  __dirname,
  '..',
  '..',
  '..',
  'vendor',
  'visualmetrics.py'
);

module.exports = {
  checkDependencies() {
    return execa(SCRIPT_PATH, ['--check']);
  },
  run(videoPath, imageDirPath, options) {
    const runOnAndroid = get(options, 'chrome.android.package', false);
    const screenShotsQuality = get(options, 'videoParams.filmstripQuality', 75);
    const keepScreenshots = get(options, 'videoParams.keepFilmstrip', true);
    const fullSizeScreenshots = get(
      options,
      'videoParams.filmstripFullSize',
      false
    );

    const scriptArgs = [
      '--video',
      videoPath,
      '--orange',
      '--perceptual',
      '--force',
      '--startwhite',
      '--renderignore',
      5,
      '--json'
    ];

    if (runOnAndroid) {
      scriptArgs.push('--viewport');
    }

    if (fullSizeScreenshots) {
      scriptArgs.push('--full');
    }

    if (keepScreenshots) {
      scriptArgs.push('-q');
      scriptArgs.push(screenShotsQuality);
      scriptArgs.unshift('--dir', imageDirPath);
    }

    log.verbose('Running visualmetrics.py ' + scriptArgs.join(' '));

    return execa(SCRIPT_PATH, scriptArgs).then(result =>
      JSON.parse(result.stdout)
    );
  }
};
