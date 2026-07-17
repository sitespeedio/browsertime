(function () {
  // The loaf script ships only the 10 frames with the most blocking
  // time, so its numbers understate busy pages. These totals are
  // computed over every long animation frame before the cut.
  if (
    PerformanceObserver.supportedEntryTypes.includes('long-animation-frame')
  ) {
    const observer = new PerformanceObserver(list => {});
    observer.observe({type: 'long-animation-frame', buffered: true});
    const entries = observer.takeRecords();

    let totalBlockingDuration = 0;
    let totalDuration = 0;
    for (let entry of entries) {
      totalBlockingDuration += entry.blockingDuration;
      totalDuration += entry.duration;
    }
    return {
      totalFrames: entries.length,
      totalBlockingDuration,
      totalDuration
    };
  }
})();
