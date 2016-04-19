'use strict';

const visualMetrics = require('./visualMetrics'),
  log = require('intel');

module.exports = {
  run(context) {
    const taskData = context.taskData;

    if (taskData.ffmpeg) {
      taskData.ffmpeg.kill('SIGHUP');
      delete taskData.ffmpeg;
    }
    
    return visualMetrics.run(taskData.mpegPath)
      .then((metrics) => {
        log.debug('Collected metrics ' + JSON.stringify(metrics));
        context.results.visualMetrics = metrics;
      });
  }
};
