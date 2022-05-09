'use strict';
const { isAndroidConfigured } = require('../../../android');
const getFont = require('./getFont');

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
  const fontFile = getFont(options);
  let fontSize = 18;
  let x = 8;
  if (isSmallish(options)) {
    fontSize = 32;
    x = 10;
  }
  if (options.safari && options.safari.useSimulator) {
    fontSize = 32;
    x = 10;
  }

  // H-h/8
  return `drawtext=${fontFile}enable='between(t,${
    Number(metric) / 1000
  },30)':x=(w-tw)/2: y=H-${pos}-h/${x}:fontcolor=white:fontsize=h/${fontSize}:box=1:boxcolor=0x000000AA:boxborderw=2:text='${metricName} ${metric}'`;
}

module.exports = function (videoMetrics, timingMetrics, options) {
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

  if (vm.LargestContentfulPaint) {
    metricsAndValues.push({
      name: 'LargestContentfulPaint',
      value: vm.LargestContentfulPaint
    });
  } else if (timingMetrics) {
    const pt = timingMetrics;
    metricsAndValues.push({
      name: 'DOMContentLoaded',
      value: pt.domContentLoadedTime
    });
  }

  metricsAndValues.sort(function (a, b) {
    return b.value - a.value;
  });

  let pos = startPosition;

  let posOffset = isSmallish(options) ? 24 : 14;

  if (options.safari && options.safari.useSimulator) {
    posOffset = 24;
  }

  for (let metricAndValue of metricsAndValues) {
    text += ',' + get(metricAndValue.value, metricAndValue.name, pos, options);
    pos += `-h/${posOffset}`;
  }
  return text;
};
