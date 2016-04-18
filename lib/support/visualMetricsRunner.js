'use strict';

const cp = require('child_process'),
 Promise = require('bluebird'),
 log = require('intel');

Promise.promisifyAll(cp);

const metricMatchers = {
 firstVisualChange: /First Visual Change: (\d+)/,
 lastVisualChange: /Last Visual Change: (\d+)/,
 visuallyComplete: /Visually Complete: (\d+)/,
 speedIndex: /Speed Index: (\d+)/,
 perceptualSpeedIndex: /Perceptual Speed Index: (\d+)/,
 visualProgress: /Visual Progress: (.*)/
};

class VisualMetricsRunner {
 constructor(scriptPath) {
   this.scriptPath = scriptPath;
 }

 checkDependencies() {
   return cp.execFileAsync('python', [this.scriptPath, '--check']);
 }

 run(inputMpg) {
   const pythonArgs = [this.scriptPath, '--video', inputMpg, '--orange', '-q', 75, '--force', '--perceptual'];

   log.debug('Spawning python ' + pythonArgs.join(' '));

   return cp.execFileAsync('python', pythonArgs)
     .then((stdout) =>
       Object.keys(metricMatchers)
         .reduce((metrics, metricId) => {
           log.trace('stdout from VisualMetrics: ' + stdout);

           const regex = metricMatchers[metricId],
             match = stdout.match(regex);

           if (match) {
             metrics[metricId] = match[1];
             log.trace('Setting metrics' + metricId + ' ' + match[1]);
           }
           return metrics;
         }, {}));
 }
}

module.exports = VisualMetricsRunner;
