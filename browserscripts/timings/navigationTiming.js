(function() {
  let t = window.performance.getEntriesByType('navigation')[0];
  const d = 0;
  if (t) {
    return {
      connectStart: Number(t.connectStart.toFixed(d)),
      domComplete: Number(t.domComplete.toFixed(d)),
      domContentLoadedEventEnd: Number(t.domContentLoadedEventEnd.toFixed(d)),
      domContentLoadedEventStart: Number(
        t.domContentLoadedEventStart.toFixed(d)
      ),
      domInteractive: Number(t.domInteractive.toFixed(d)),
      domainLookupEnd: Number(t.domainLookupEnd.toFixed(d)),
      domainLookupStart: Number(t.domainLookupStart.toFixed(d)),
      duration: Number(t.duration.toFixed(d)),
      fetchStart: Number(t.fetchStart.toFixed(d)),
      loadEventEnd: Number(t.loadEventEnd.toFixed(d)),
      loadEventStart: Number(t.loadEventStart.toFixed(d)),
      redirectEnd: Number(t.redirectEnd.toFixed(d)),
      redirectStart: Number(t.redirectStart.toFixed(d)),
      requestStart: Number(t.requestStart.toFixed(d)),
      responseEnd: Number(t.responseEnd.toFixed(d)),
      responseStart: Number(t.responseStart.toFixed(d)),
      secureConnectionStart: Number(t.secureConnectionStart.toFixed(d)),
      startTime: Number(t.startTime.toFixed(d)),
      unloadEventEnd: Number(t.unloadEventEnd.toFixed(d)),
      unloadEventStart: Number(t.unloadEventStart.toFixed(d)),
      workerStart: Number(t.workerStart.toFixed(d))
    };
  } else {
    // For Safari
    t = window.performance.timing;
    return {
      navigationStart: 0,
      unloadEventStart:
        t.unloadEventStart > 0
          ? t.unloadEventStart - t.navigationStart
          : undefined,
      unloadEventEnd:
        t.unloadEventEnd > 0 ? t.unloadEventEnd - t.navigationStart : undefined,
      redirectStart:
        t.redirectStart > 0 ? t.redirectStart - t.navigationStart : undefined,
      redirectEnd:
        t.redirectEnd > 0 ? t.redirectEnd - t.navigationStart : undefined,
      fetchStart: t.fetchStart - t.navigationStart,
      domainLookupStart: t.domainLookupStart - t.navigationStart,
      domainLookupEnd: t.domainLookupEnd - t.navigationStart,
      connectStart: t.connectStart - t.navigationStart,
      connectEnd: t.connectEnd - t.navigationStart,
      secureConnectionStart: t.secureConnectionStart
        ? t.secureConnectionStart - t.navigationStart
        : undefined,
      requestStart: t.requestStart - t.navigationStart,
      responseStart: t.responseStart - t.navigationStart,
      responseEnd: t.responseEnd - t.navigationStart,
      domLoading: t.domLoading - t.navigationStart,
      domInteractive: t.domInteractive - t.navigationStart,
      domContentLoadedEventStart:
        t.domContentLoadedEventStart - t.navigationStart,
      domContentLoadedEventEnd: t.domContentLoadedEventEnd - t.navigationStart,
      domComplete: t.domComplete - t.navigationStart,
      loadEventStart: t.loadEventStart - t.navigationStart,
      loadEventEnd: t.loadEventEnd - t.navigationStart
    };
  }
})();
