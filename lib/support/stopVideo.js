'use strict';

let spawn = require('child_process').spawn,
  log = require('intel');

function spawnVisualMetrics(data, results) {

  let visualMetricsArgs = [process.env.VISUALMETRICS, '--video', data.dir + '/' +  data.name + '-run-' + data.run + '.mpg', '--orange', '--dir',  data.dir + '/images'  , '--force']

  log.debug('Spawning python ' + visualMetricsArgs.join(' '));

  let visualMetrics = spawn('python', visualMetricsArgs);

  return new Promise(function(resolve, reject) {
    let metrics = {};
    let metricNames = {
      firstVisualChange: 'First Visual Change',
      lastVisualChange: 'Last Visual Change',
      speedIndex: 'Speed Index'
    };

    // fetch the metrics
    visualMetrics.stdout.on('data', function(data) {
      Object.keys(metricNames).forEach(function(metric) {
        if (data.indexOf(metricNames[metric]) > -1) {
          var reg = metricNames[metric] + ': ([0-9]*)?';
          metrics[metric] = parseInt(data.toString().match(reg)[1]);
        }
      });

      // special handling for visual progress, would be cool of Visual Metrics
      // would output JSON instead
      metrics['visualProgress'] = data.toString().slice(data.toString().indexOf('Visual Progress:') + 17, data.toString().length - 1);
    });

    visualMetrics.on('exit', function(code, signal) {
      results.visualMetrics = metrics;
      log.debug('Collected metrics ' + JSON.stringify(metrics) + ' ' + signal);
      delete data.ffmpeg;
      resolve();
    });

    visualMetrics.on('error', function(err) {
      reject(new Error('Python process error with code: ' + err));
    });

    visualMetrics.on('close', function(code) {
      if (code !==0) {
        log.error('We got exit code ' + code + ' from python');
        reject(new Error('Python process exited with code: ' + code));
      }
    });
  });

}

module.exports = {
  stop(runner, data, results) {
    // stop ffmpeg
    if (data.ffmpeg) {
      data.ffmpeg.kill('SIGHUP');
    }
    // and start visual metrics
    return spawnVisualMetrics(data, results);
  }
};
