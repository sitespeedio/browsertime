'use strict';

module.exports = function(metrics) {
  const videoMetrics = {};
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

      // Oh noo the painting on the screen goes backward
      // see https://github.com/sitespeedio/sitespeed.io/issues/2259#issuecomment-456878707
      if (metrics.VisualComplete85 && Number(parts[1].replace('%', '')) < 85) {
        metrics.VisualComplete85 = undefined;
        metrics.VisualComplete95 = undefined;
        metrics.VisualComplete95 = undefined;
      } else if (
        metrics.VisualComplete95 &&
        Number(parts[1].replace('%', '')) < 95
      ) {
        metrics.VisualComplete95 = undefined;
        metrics.VisualComplete95 = undefined;
      } else if (
        metrics.VisualComplete99 &&
        Number(parts[1].replace('%', '')) < 99
      ) {
        metrics.VisualComplete99 = undefined;
      }
    }
  }
  if (metrics.videoRecordingStart) {
    videoMetrics.videoRecordingStart = metrics.videoRecordingStart;
    delete metrics.videoRecordingStart;
  }
  videoMetrics.visualMetrics = metrics;
  return videoMetrics;
};
