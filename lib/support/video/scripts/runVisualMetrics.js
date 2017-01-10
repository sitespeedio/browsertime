'use strict';

const visualMetrics = require('../visualMetrics'),
  log = require('intel');

module.exports = {
  run(context) {
    const storageManager = context.storageManager,
      taskData = context.taskData;
    context.log.debug('Running visualMetrics');
    return storageManager.createSubDataDir('video', 'images', '' + context.index)
      .then((imageDir) => visualMetrics.run(taskData.videoPaths['' + context.index], imageDir, context.options))
      .then((metrics) => {
        log.debug('Collected metrics ' + JSON.stringify(metrics));
        context.results.visualMetrics = metrics;
      });
  }
};
