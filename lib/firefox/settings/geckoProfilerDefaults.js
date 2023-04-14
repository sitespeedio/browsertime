export const geckoProfilerDefaults = {
  features: 'js,stackwalk,leaf',
  threads: 'GeckoMain,Compositor,Renderer',
  desktopSamplingInterval: 1,
  androidSamplingInterval: 4,
  bufferSize: 13_107_200 // 100MB
};
