'use strict';

const cp = require('child_process'),
  path = require('path'),
  Promise = require('bluebird'),
  log = require('intel');

Promise.promisifyAll(cp);

const SCRIPT_PATH = path.join(__dirname, '..', '..', 'vendor', 'visualmetrics.py');

module.exports = {
  checkDependencies() {
    return cp.execFileAsync(SCRIPT_PATH, ['--check']);
  },

  run(inputMpg, dataDir) {
    const scriptArgs = ['--video', inputMpg, '--orange', '--dir', path.join(dataDir, 'images'), '-q', 75 , '--perceptual', '--force', '--json'];

    log.debug('Spawning visualmetrics.py ' + scriptArgs.join(' '));

    return cp.execFileAsync(SCRIPT_PATH, scriptArgs)
      .then((stdout) => {
        log.trace('stdout from VisualMetrics: ' + stdout);
        return JSON.parse(stdout);
      });
  }
};
