'use strict';

module.exports = function addTimingMetrics(metrics, options) {
  let extras = '';
  const vm = metrics.visualMetrics;
  // we only add if we collect VisualMetrics
  if (options.visualMetrics) {
    const speedIndex = `drawtext=enable='between(t,${Number(vm.SpeedIndex) /
      1000},30)':x=(w-tw)/2: y=H-124:fontcolor=white:fontsize=26:box=1:boxcolor=0x000000AA:text='SpeedIndex ${
      vm.SpeedIndex
    }'`;

    const firstVisualChange = `drawtext=enable='between(t,${Number(
      vm.FirstVisualChange
    ) /
      1000},30)':x=(w-tw)/2: y=H-180:fontcolor=white:fontsize=26:box=1:boxcolor=0x000000AA:text='FirstVisualChange ${
      vm.FirstVisualChange
    }'`;

    const visualComplete85 = `drawtext=enable='between(t,${Number(
      vm.VisualComplete85
    ) /
      1000},30)':x=(w-tw)/2: y=H-152:fontcolor=white:fontsize=26:box=1:boxcolor=0x000000AA:text='VisualComplete85 ${
      vm.VisualComplete85
    }'`;

    const lastVisualChange = `drawtext=enable='between(t,${Number(
      vm.LastVisualChange
    ) /
      1000},30)':x=(w-tw)/2: y=H-96:fontcolor=white:fontsize=26:box=1:boxcolor=0x000000AA:text='LastVisualChange ${
      vm.LastVisualChange
    }'`;

    extras = `,${speedIndex}, ${lastVisualChange}, ${visualComplete85}, ${firstVisualChange}`;
  }
  return extras;
};
