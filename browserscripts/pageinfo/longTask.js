(function(minLength) {
  const observer = new PerformanceObserver(list => {});
  observer.observe({ type: 'longtask', buffered: true });
  const entries = observer.takeRecords();
  const cleaned = [];
  for (let event of entries) {
    if (event.duration >= minLength) {
      const e = {};
      e.duration = event.duration;
      e.name = event.name;
      e.startTime = event.startTime;
      e.attribution = [];
      for (let at of event.attribution) {
        const a = {};
        a.containerId = at.containerId;
        a.containerName = at.containerName;
        a.containerSrc = at.containerSrc;
        a.containerType = at.containerType;
        e.attribution.push(a);
      }
      cleaned.push(e);
    }
  }
  return cleaned;
})(arguments[arguments.length - 1]);
