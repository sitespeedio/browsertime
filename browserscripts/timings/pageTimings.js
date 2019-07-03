(function() {
  let t = window.performance.getEntriesByType('navigation')[0];
  const d = 0;
  if (t) {
    return {
      domainLookupTime: Number(
        (t.domainLookupEnd - t.domainLookupStart).toFixed(d)
      ),
      redirectionTime: Number((t.redirectEnd - t.redirectStart).toFixed(d)),
      serverConnectionTime: Number((t.connectEnd - t.connectStart).toFixed(d)),
      serverResponseTime: Number((t.responseEnd - t.requestStart).toFixed(d)),
      pageDownloadTime: Number((t.responseEnd - t.responseStart).toFixed(d)),
      domInteractiveTime: Number(t.domInteractive.toFixed(d)),
      domContentLoadedTime: Number(t.domContentLoadedEventStart.toFixed(d)),
      pageLoadTime: Number(t.loadEventStart.toFixed(d)),
      frontEndTime: Number((t.loadEventStart - t.responseEnd).toFixed(d)),
      backEndTime: Number(t.responseStart.toFixed(d))
    };
  } else {
    // Safari
    t = window.performance.timing;
    return {
      domainLookupTime: t.domainLookupEnd - t.domainLookupStart,
      redirectionTime: t.fetchStart - t.navigationStart,
      serverConnectionTime: t.connectEnd - t.connectStart,
      serverResponseTime: t.responseEnd - t.requestStart,
      pageDownloadTime: t.responseEnd - t.responseStart,
      domInteractiveTime: t.domInteractive - t.navigationStart,
      domContentLoadedTime: t.domContentLoadedEventStart - t.navigationStart,
      pageLoadTime: t.loadEventStart - t.navigationStart,
      frontEndTime: t.loadEventStart - t.responseEnd,
      backEndTime: t.responseStart - t.navigationStart
    };
  }
})();
