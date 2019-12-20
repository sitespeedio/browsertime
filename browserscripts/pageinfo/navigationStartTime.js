(function () {
  if (window.performance.timeOrigin) {
    return Number(window.performance.timeOrigin.toFixed(0));
  }
  if (window.performance.timing.navigationStart) {
    return Number(window.performance.timing.navigationStart.toFixed(0));
  }
  return undefined;
})();
