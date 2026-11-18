(function() {
  const supported = PerformanceObserver.supportedEntryTypes;
  if (!supported || supported.indexOf('element') === -1) {
    return;
  }
  const elements = {};

  // Each iframe reports its own elements, with times from when the iframe
  // started. Move the times to the clock of the top page. A time of 0 means
  // that the browser did not give the time, so keep it.
  function collect(view) {
    const observer = new view.PerformanceObserver(list => {});
    observer.observe({ type: 'element', buffered: true });
    const entries = observer.takeRecords();
    const offset = view.performance.timeOrigin - performance.timeOrigin;
    const toTopPage = time =>
      Number((time > 0 ? time + offset : time).toFixed(0));
    for (let entry of entries) {
      // Look out for colliding identifiers and missing identifiers
      elements[entry.identifier] = {
        duration: entry.duration,
        url: entry.url,
        loadTime: toTopPage(entry.loadTime),
        renderTime: toTopPage(entry.renderTime),
        startTime: toTopPage(entry.startTime),
        naturalHeight: entry.naturalHeight,
        naturalWidth: entry.naturalWidth,
        tagName: entry.element ? entry.element.tagName : ''
      };
    }
    for (let index = 0; index < view.frames.length; index++) {
      try {
        collect(view.frames[index]);
      } catch (e) {
        // An iframe from another origin cannot be reached
      }
    }
  }

  collect(window);
  return elements;
})();
