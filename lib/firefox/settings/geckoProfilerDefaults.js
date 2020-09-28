'use strict';

module.exports = {
  features: 'js,stackwalk,leaf',
  threads: 'GeckoMain,Compositor,Renderer',
  desktop_sampling_interval: 1,
  android_sampling_interval: 4,
  bufferSize: 13107200 // 100MB
};
