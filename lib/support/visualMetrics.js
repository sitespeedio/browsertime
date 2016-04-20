'use strict';

const cp = require('child_process'),
  path = require('path'),
  Promise = require('bluebird'),
  os = require('os'),
  log = require('intel');

Promise.promisifyAll(cp);

const SCRIPT_PATH = path.join(__dirname, '..', '..', 'vendor', 'visualmetrics.py');

const metricMatchers = {
  firstVisualChange: /First Visual Change: (\d+)/,
  lastVisualChange: /Last Visual Change: (\d+)/,
  visuallyComplete: /Visually Complete: (\d+)/,
  speedIndex: /Speed Index: (\d+)/,
  perceptualSpeedIndex: /Perceptual Speed Index: (\d+)/,
  visualProgress: /Visual Progress: (.*)/
};

module.exports = {
  checkDependencies() {
    return cp.execFileAsync(SCRIPT_PATH, ['--check']);
  },

  run(inputMpg) {
    const scriptArgs = ['--video', inputMpg, '--orange', '--dir', path.join(os.tmpdir(), 'visualmetrics'), '--perceptual', '--force'];

    log.debug('Spawning visualmetrics.py ' + scriptArgs.join(' '));

    return cp.execFileAsync(SCRIPT_PATH, scriptArgs)
      .then((stdout) => {
        log.trace('stdout from VisualMetrics: ' + stdout);
        return Object.keys(metricMatchers)
          .reduce((metrics, metricId) => {

            const regex = metricMatchers[metricId],
              match = stdout.match(regex);

            if (match) {
              metrics[metricId] = match[1];
              log.trace('Set metric ' + metricId + ' to ' + metrics[metricId]);
            }
            return metrics;
          }, {})
      });
  }
};
