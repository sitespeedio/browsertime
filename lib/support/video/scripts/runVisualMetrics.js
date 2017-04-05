'use strict';

const visualMetrics = require('../visualMetrics'),
  log = require('intel').getLogger('browsertime.video');

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
        // Jack in that Visual Complete 85%
        if (metrics.VisualProgress) {
          const eachLine = metrics.VisualProgress.split(',');
          for (const timeAndPercentage of eachLine) {
            const parts = timeAndPercentage.split('=');
            if (Number(parts[1].replace('%','')) >= 85) {
              context.results.visualMetrics.VisualComplete85 = Number(parts[0]);
              break;
            }
          }
        }
      });
  }
};
