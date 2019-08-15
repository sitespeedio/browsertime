(function() {
  // Guard for Safari
  if (typeof PerformanceObserver.entryTypes !== 'function') {
    return;
  }
  // See https://web.dev/layout-instability-api
  const observer = new PerformanceObserver(list => {});
  observer.observe({ type: 'layout-shift', buffered: true });
  const list = observer.takeRecords();
  let score = 0;
  for (let entry of list) {
    score += entry.value;
  }
  return score * 100;
})();
