(function() {
  const observer = new PerformanceObserver(list => {});
  observer.observe({ type: 'largest-contentful-paint', buffered: true });
  const entries = observer.takeRecords();
  if (entries.length > 0) {
    const largestEntry = entries[entries.length - 1];
    return {
      duration: largestEntry.duration,
      id: largestEntry.id,
      url: largestEntry.url,
      loadTime: largestEntry.loadTime.toFixed(0),
      renderTime: largestEntry.renderTime.toFixed(0),
      size: largestEntry.size,
      startTime: largestEntry.startTime.toFixed(0)
    };
  } else return;
})();
