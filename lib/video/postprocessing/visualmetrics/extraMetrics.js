export function extraMetrics(metrics) {
  const videoMetrics = {};
  if (!metrics.VisualReadiness) {
    metrics.VisualReadiness =
      Number(metrics.LastVisualChange) - Number(metrics.FirstVisualChange);
  }
  // Jack in that Visual Complete 85%, 95% and 99%
  if (metrics.VisualProgress) {
    const eachLine = metrics.VisualProgress.split(',');
    for (const timeAndPercentage of eachLine) {
      const [timestamp, percent] = timeAndPercentage.split('=');
      if (Number.parseInt(percent, 10) >= 85 && !metrics.VisualComplete85) {
        metrics.VisualComplete85 = Number.parseInt(timestamp, 10);
      }
      if (Number.parseInt(percent, 10) >= 95 && !metrics.VisualComplete95) {
        metrics.VisualComplete95 = Number.parseInt(timestamp, 10);
      }
      if (Number.parseInt(percent, 10) >= 99 && !metrics.VisualComplete99) {
        metrics.VisualComplete99 = Number.parseInt(timestamp, 10);
      }

      // Oh noo the painting on the screen goes backward
      // see https://github.com/sitespeedio/sitespeed.io/issues/2259#issuecomment-456878707
      if (metrics.VisualComplete85 && Number.parseInt(percent, 10) < 85) {
        metrics.VisualComplete85 = undefined;
        metrics.VisualComplete95 = undefined;
        metrics.VisualComplete95 = undefined;
      } else if (
        metrics.VisualComplete95 &&
        Number.parseInt(percent, 10) < 95
      ) {
        metrics.VisualComplete95 = undefined;
        metrics.VisualComplete95 = undefined;
      } else if (
        metrics.VisualComplete99 &&
        Number.parseInt(percent, 10) < 99
      ) {
        metrics.VisualComplete99 = undefined;
      }
    }
  }
  if (metrics.videoRecordingStart) {
    videoMetrics.videoRecordingStart = metrics.videoRecordingStart;
  }
  videoMetrics.visualMetrics = metrics;
  return videoMetrics;
}
