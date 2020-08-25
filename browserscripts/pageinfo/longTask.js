(function(minLength) {
  const supported = PerformanceObserver.supportedEntryTypes;
  if (!supported || supported.indexOf('longtask') === -1) {
    return;
  }
  const longTaskObserver = new PerformanceObserver(list => {});
  longTaskObserver.observe({type: 'longtask', buffered: true});
  const cleaned = [];
  for (let entry of longTaskObserver.takeRecords()) {
    if (entry.duration >= minLength) {
      const e = {};
      e.duration = entry.duration;
      e.name = entry.name;
      e.startTime = entry.startTime;
      e.attribution = [];
      for (let at of entry.attribution) {
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
