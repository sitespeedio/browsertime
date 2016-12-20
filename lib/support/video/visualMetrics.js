'use strict';

const execa = require('execa'),
  log = require('intel'),
  path = require('path');

const SCRIPT_PATH = path.join(__dirname, '..', '..', '..', 'vendor', 'visualmetrics.py');

module.exports = {
  checkDependencies() {
    return execa(SCRIPT_PATH, ['--check']);
  },
  run(videoPath, imageDirPath) {
    const scriptArgs = [
      '--video', videoPath,
      '--orange',
      '-q', 75,
      '--perceptual',
      '--force',
      '--white',
      '--viewport',
      '--json'];

    if (imageDirPath) {
      scriptArgs.unshift('--dir', imageDirPath);
    }

    log.verbose('Running visualmetrics.py ' + scriptArgs.join(' '));

    return execa(SCRIPT_PATH, scriptArgs)
      .then((result) => JSON.parse(result.stdout));
  }
};
