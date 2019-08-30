(function() {
  const supported = PerformanceObserver.supportedEntryTypes;
  if (!supported || supported.indexOf('largest-contentful-paint') === -1) {
    return;
  }
  const observer = new PerformanceObserver(list => {});
  observer.observe({ type: 'largest-contentful-paint', buffered: true });
  const entries = observer.takeRecords();
  if (entries.length > 0) {
    const largestEntry = entries[entries.length - 1];
    return {
      duration: largestEntry.duration,
      id: largestEntry.id,
      url: largestEntry.url,
      loadTime: Number(largestEntry.loadTime.toFixed(0)),
      renderTime: Number(largestEntry.renderTime.toFixed(0)),
      size: largestEntry.size,
      startTime: Number(largestEntry.startTime.toFixed(0)),
      tagName: largestEntry.element ? largestEntry.element.tagName : ''
    };
  } else return;
})();
