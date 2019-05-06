'use strict';
const { isAndroidConfigured } = require('../../../android');

function isSmallish(options) {
  return (
    (options.chrome &&
      options.chrome.mobileEmulation &&
      options.chrome.mobileEmulation.deviceName) ||
    isAndroidConfigured(options)
  );
}

function get(metric, metricName, pos, options) {
  // We need the fontfile running Android from a Mac
  const fontFile =
    process.platform === 'darwin'
      ? '/System/Library/Fonts/SFNSText.ttf:'
      : options.videoParams.fontPath
      ? options.videoParams.fontPath + ':'
      : '';

  let fontSize = 16;
  let x = 8;
  if (isSmallish(options)) {
    fontSize = 24;
    x = 10;
  }

  // H-h/8
  return `drawtext=${fontFile}enable='between(t,${Number(metric) /
    1000},30)':x=(w-tw)/2: y=H-${pos}-h/${x}:fontcolor=white:fontsize=h/${fontSize}:box=1:boxcolor=0x000000AA:boxborderw=2:text='${metricName} ${metric}'`;
}

module.exports = function(videoMetrics, timingMetrics, options) {
  let text = '';
  const vm = videoMetrics.visualMetrics;
  const startPosition = 'h/10';
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
  if (timingMetrics) {
    const pt = timingMetrics;
    metricsAndValues.push({
      name: 'DOMContentLoaded',
      value: pt.domContentLoadedTime
    });
  }

  metricsAndValues.sort(function(a, b) {
    return b.value - a.value;
  });

  let pos = startPosition;

  let posOffset = isSmallish(options) ? 20 : 14;

  for (let metricAndValue of metricsAndValues) {
    text += ',' + get(metricAndValue.value, metricAndValue.name, pos, options);
    pos += `-h/${posOffset}`;
  }
  return text;
};
