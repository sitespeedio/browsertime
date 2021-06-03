(function() {
  const supported = PerformanceObserver.supportedEntryTypes;
  if (!supported || supported.indexOf('layout-shift') === -1) {
    return;
  }
  // See https://web.dev/layout-instability-api
  // https://github.com/mmocny/web-vitals/wiki/Snippets-for-LSN-using-PerformanceObserver#max-session-gap1s-limit5s
  let max = 0;
  let curr = 0; 
  let firstTs = Number.NEGATIVE_INFINITY;
  let  prevTs = Number.NEGATIVE_INFINITY;
  const observer = new PerformanceObserver(list => {});
  observer.observe({ type: 'layout-shift', buffered: true });
  const list = observer.takeRecords();
  for (let entry of list) {
    if (entry.hadRecentInput) {
      continue;
    } 
    if (entry.startTime - firstTs > 5000 || entry.startTime - prevTs > 1000) {
      firstTs = entry.startTime;
      curr = 0;
    }
    prevTs = entry.startTime;
    curr += entry.value;
    max = Math.max(max, curr);
  }
  return max;
})();
