'use strict';

let VisualMetricsRunner = require('./visualMetricsRunner'),
  log = require('intel');

function getVisualMetrics(data, results, index) {
  const runner = new VisualMetricsRunner(process.env.VISUALMETRICS);
  // TODO we should catch error
  runner.run(data.dir + '/' +  data.name + '-run-' + index + '.mpg').then((metrics) => {
    results.visualMetrics = metrics;
    log.debug('Collected metrics ' + JSON.stringify(metrics));
    delete data.ffmpeg;
  })
}

module.exports = {
  run(context) {
    if (context.taskData.ffmpeg) {
      context.taskData.ffmpeg.kill('SIGHUP');
    }
    // and start visual metrics
    return getVisualMetrics(context.taskData, context.results, context.index);
  }
};
