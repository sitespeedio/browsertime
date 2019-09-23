(function() {
    const supported = PerformanceObserver.supportedEntryTypes;
    if (!supported || supported.indexOf('first-input') === -1) {
      return;
    }
    const observer = new PerformanceObserver(list => {});
    observer.observe({ type: 'first-input', buffered: true });
    const entries = observer.takeRecords();
    if (entries.length > 0) {
      const largestEntry = entries[entries.length - 1];
      return {
        duration: largestEntry.duration,
        name: largestEntry.name,
        processingEnd: Number(largestEntry.processingEnd.toFixed(0)),
        processingStart: Number(largestEntry.processingStart.toFixed(0)),
        startTime: Number(largestEntry.startTime.toFixed(0)),
      };
    } else return;
  })();