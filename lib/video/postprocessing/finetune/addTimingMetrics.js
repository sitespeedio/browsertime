'use strict';

function get(metric, metricName, pos) {
  return `drawtext=enable='between(t,${Number(metric) /
    1000},30)':x=(w-tw)/2: y=H-${pos}:fontcolor=white:fontsize=26:box=1:boxcolor=0x000000AA:text='${metricName} ${metric}'`;
}

module.exports = function addTimingMetrics(metrics, options) {
  let extras = '';
  const vm = metrics.visualMetrics;
  // we only add if we collect VisualMetrics
  // but soon we can add things like
  // const pt = metrics.browserScripts.timings.pageTimings;
  if (options.visualMetrics) {
    const speedIndex = get(vm.SpeedIndex, 'SpeedIndex', 124);
    const firstVisualChange = get(
      vm.FirstVisualChange,
      'FirstVisualChange',
      180
    );
    const visualComplete85 = get(vm.VisualComplete85, 'VisualComplete85', 152);
    const lastVisualChange = get(vm.LastVisualChange, 'LastVisualChange', 96);
    extras += `,${speedIndex}, ${lastVisualChange}, ${visualComplete85}, ${firstVisualChange}`;
  }
  return extras;
};
