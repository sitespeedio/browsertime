export const geckoProfilerDefaults = {
  features: 'js,stackwalk,leaf',
  threads: 'GeckoMain,Compositor,Renderer',
  desktop_sampling_interval: 1,
  android_sampling_interval: 4,
  bufferSize: 13_107_200 // 100MB
};
