'use strict';

function get(metric, metricName, pos, options) {
  // We need the fontfile running Android from a Mac
  const fontFile =
    process.platform === 'darwin'
      ? '/System/Library/Fonts/SFNSText.ttf:'
      : options.videoParams.fontPath
        ? options.videoParams.fontPath + ':'
        : '';

  return `drawtext=${fontFile}enable='between(t,${Number(metric) /
    1000},30)':x=(w-tw)/2: y=H-${pos}:fontcolor=white:fontsize=26:box=1:boxcolor=0x000000AA:boxborderw=2:text='${metricName} ${metric}'`;
}

module.exports = function addTimingMetrics(metrics, options) {
  let text = '';
  const vm = metrics.visualMetrics;
  const startPosition = 230;
  const gap = 30;
  const metricsAndValues = [];

  if (options.visualMetrics) {
    metricsAndValues.push({
      name: 'FirstVisualChange',
      value: vm.FirstVisualChange
    });
    metricsAndValues.push({ name: 'SpeedIndex', value: vm.SpeedIndex });
    metricsAndValues.push({
      name: 'VisualComplete85',
      value: vm.VisualComplete85
    });
    metricsAndValues.push({
      name: 'LastVisualChange',
      value: vm.LastVisualChange
    });
  }
  if (
    metrics.browserScripts &&
    metrics.browserScripts.timings &&
    metrics.browserScripts.timings.pageTimings
  ) {
    const pt = metrics.browserScripts.timings.pageTimings;
    metricsAndValues.push({
      name: 'DOMContentLoaded',
      value: pt.domContentLoadedTime
    });
  }

  metricsAndValues.sort(function(a, b) {
    return a.value - b.value;
  });

  let pos = startPosition;
  for (let metricAndValue of metricsAndValues) {
    text += ',' + get(metricAndValue.value, metricAndValue.name, pos, options);
    pos -= gap;
  }
  return text;
};
