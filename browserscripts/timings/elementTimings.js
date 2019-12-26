(function() {
  const supported = PerformanceObserver.supportedEntryTypes;
  if (!supported || supported.indexOf('element') === -1) {
    return;
  }
  const observer = new PerformanceObserver(list => {});
  observer.observe({ type: 'element', buffered: true });
  const entries = observer.takeRecords();
  const elements = {};
  for (let entry of entries) {
    // Look out for colliding identifiers and missing identifiers
    elements[entry.identifier] = {
      duration: entry.duration,
      url: entry.url,
      loadTime: Number(entry.loadTime.toFixed(0)),
      renderTime: Number(entry.renderTime.toFixed(0)),
      startTime: Number(entry.startTime.toFixed(0)),
      naturalHeight: entry.naturalHeight,
      naturalWidth: entry.naturalWidth,
      tagName: entry.element ? entry.element.tagName : ''
    };
  }
  return elements;
})();
