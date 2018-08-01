'use strict';

const visualMetrics = require('./visualMetrics');
const log = require('intel').getLogger('browsertime.video');
const path = require('path');

module.exports = async function(videoDir, videoPath, index, results, options) {
  log.debug('Running visualMetrics');
  const imageDir = path.join(videoDir, 'images', '' + index);
  const metrics = await visualMetrics.run(videoPath, imageDir, options);

  log.debug('Collected metrics ' + JSON.stringify(metrics));

  if (!metrics.VisualReadiness) {
    metrics.VisualReadiness =
      Number(metrics.LastVisualChange) - Number(metrics.FirstVisualChange);
  }
  // Jack in that Visual Complete 85%, 95% and 99%
  if (metrics.VisualProgress) {
    const eachLine = metrics.VisualProgress.split(',');
    for (const timeAndPercentage of eachLine) {
      const parts = timeAndPercentage.split('=');
      if (
        Number(parts[1].replace('%', '')) >= 85 &&
        !metrics.VisualComplete85
      ) {
        metrics.VisualComplete85 = Number(parts[0]);
      }
      if (
        Number(parts[1].replace('%', '')) >= 95 &&
        !metrics.VisualComplete95
      ) {
        metrics.VisualComplete95 = Number(parts[0]);
      }
      if (
        Number(parts[1].replace('%', '')) >= 99 &&
        !metrics.VisualComplete99
      ) {
        metrics.VisualComplete99 = Number(parts[0]);
      }
    }
  }
  results.visualMetrics = metrics;
};
