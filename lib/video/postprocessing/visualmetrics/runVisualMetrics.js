'use strict';

const visualMetrics = require('./visualMetrics');
const log = require('intel').getLogger('browsertime.video');
const path = require('path');

module.exports = async function(
  videoDir,
  videoPath,
  index,
  results,
  storageManager,
  options
) {
  log.debug('Running visualMetrics');
  // If we want to use the Hero functionality of Visual Metrics
  // we need to create the hero JSON file.
  if (
    options.visualElements &&
    results.browserScripts.pageinfo.visualElements
  ) {
    await storageManager.writeJson(
      index + '-visualElements.json',
      results.browserScripts.pageinfo.visualElements,
      true
    );
  }
  const imageDir = path.join(videoDir, 'images', '' + index);
  const elementsFile = path.join(
    storageManager.directory,
    index + '-visualElements.json.gz'
  );
  const metrics = await visualMetrics.run(
    videoPath,
    imageDir,
    elementsFile,
    options
  );

  // Remove the file
  if (
    options.visualElements &&
    results.browserScripts.pageinfo.visualElements
  ) {
    await storageManager.rm(index + '-visualElements.json.gz');
  }

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
