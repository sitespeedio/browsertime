'use strict';

function get(metric, metricName, pos) {
  // We need the fontfile running Android from a Mac
  const fontFile =
    process.platform === 'darwin' ? '/System/Library/Fonts/SFNSText.ttf:' : '';

  return `drawtext=${fontFile}enable='between(t,${Number(metric) /
    1000},30)':x=(w-tw)/2: y=H-${pos}:fontcolor=white:fontsize=26:box=1:boxcolor=0x000000AA:boxborderw=2:text='${metricName} ${metric}'`;
}

module.exports = function addTimingMetrics(metrics, options) {
  let extras = '';
  const vm = metrics.visualMetrics;
  const startPosition = 230;
  const gap = 30;
  const data = [];

  if (options.visualMetrics) {
    data.push({ name: 'FirstVisualChange', value: vm.FirstVisualChange });
    data.push({ name: 'SpeedIndex', value: vm.SpeedIndex });
    data.push({ name: 'VisualComplete85', value: vm.VisualComplete85 });
    data.push({ name: 'LastVisualChange', value: vm.LastVisualChange });
  }
  if (
    metrics.browserScripts &&
    metrics.browserScripts.timings &&
    metrics.browserScripts.timings.pageTimings
  ) {
    const pt = metrics.browserScripts.timings.pageTimings;
    data.push({ name: 'DOMContentLoaded', value: pt.domContentLoadedTime });
  }

  data.sort(function(a, b) {
    return a.value - b.value;
  });

  let pos = startPosition;
  for (let d of data) {
    extras += ',' + get(d.value, d.name, pos);
    pos -= gap;
  }
  return extras;
};
