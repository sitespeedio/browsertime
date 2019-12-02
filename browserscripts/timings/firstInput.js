(function() {
  const supported = PerformanceObserver.supportedEntryTypes;
  if (!supported || supported.indexOf("first-input") === -1) {
    return;
  }
  const observer = new PerformanceObserver(list => {});
  observer.observe({ type: "first-input", buffered: true });
  const entries = observer.takeRecords();
  if (entries.length > 0) {
    const entry = entries[entries.length - 1];
    return {
      duration: entry.duration,
      name: entry.name,
      processingEnd: Number(entry.processingEnd.toFixed(0)),
      processingStart: Number(entry.processingStart.toFixed(0)),
      startTime: Number(entry.startTime.toFixed(0)),
      delay: Number((entry.processingStart - entry.startTime).toFixed(1))
    };
  } else return;
})();
