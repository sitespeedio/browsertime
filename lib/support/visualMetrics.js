'use strict';

const execa = require('execa'),
  path = require('path'),
  log = require('intel');

const SCRIPT_PATH = path.join(__dirname, '..', '..', 'vendor', 'visualmetrics.py');

module.exports = {
  checkDependencies() {
    return execa(SCRIPT_PATH, ['--check']);
  },

  run(inputMpg, dataDir) {
    const scriptArgs = ['--video', inputMpg, '--orange', '--dir', path.join(dataDir, 'images'), '-q', 75 , '--perceptual', '--force', '--json'];

    log.debug('Spawning visualmetrics.py ' + scriptArgs.join(' '));

    return execa(SCRIPT_PATH, scriptArgs)
      .then((result) => {
        log.trace('stdout from VisualMetrics: ' + result.stdout);
        return JSON.parse(result.stdout);
      });
  }
};
