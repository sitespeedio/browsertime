(function() {
  // The CPU Performance API (https://wicg.github.io/cpu-performance/) reports
  // the browser's own device rating: 1 to 4, or 0 when it cannot classify the
  // device. Chromium exposes it from Chrome 152; other browsers return
  // undefined so the metric is simply absent there.
  return 'cpuPerformance' in navigator ? navigator.cpuPerformance : undefined;
})();
