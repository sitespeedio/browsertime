(function () {
  const supported = PerformanceObserver.supportedEntryTypes;
  if (!supported || supported.indexOf('soft-navigation') === -1) {
    return;
  }
  var startIndex = window.__bt_softNavCount || 0;
  const allNew = performance.getEntriesByType('soft-navigation').slice(startIndex);
  if (allNew.length === 0) {
    return;
  }
  // Use the last entry — a single user interaction can trigger
  // multiple intermediate soft navigations (e.g. React, Turbo)
  const entry = allNew[allNew.length - 1];
  var navId = entry.navigationId;

  // CLS for this soft navigation
  var cls = 0;
  if (supported.indexOf('layout-shift') !== -1) {
    const observer = new PerformanceObserver(list => {});
    observer.observe({type: 'layout-shift', buffered: true});
    const shifts = observer.takeRecords().filter(function (s) {
      return s.navigationId === navId;
    });
    var max = 0;
    var curr = 0;
    var firstTs = Number.NEGATIVE_INFINITY;
    var prevTs = Number.NEGATIVE_INFINITY;
    for (let s of shifts) {
      if (s.hadRecentInput) continue;
      if (s.startTime - firstTs > 5000 || s.startTime - prevTs > 1000) {
        firstTs = s.startTime;
        curr = 0;
      }
      prevTs = s.startTime;
      curr += s.value;
      max = Math.max(max, curr);
    }
    cls = max;
  }

  // INP for this soft navigation
  var inp = 0;
  if (supported.indexOf('event') !== -1) {
    const observer = new PerformanceObserver(list => {});
    observer.observe({type: 'event', buffered: true});
    const events = observer.takeRecords().filter(function (e) {
      return e.navigationId === navId && e.interactionId;
    });
    const MAX_INTERACTIONS = 10;
    const longestList = [];
    const longestMap = {};
    for (let e of events) {
      var minLongest = longestList[longestList.length - 1];
      var existing = longestMap[e.interactionId];
      if (existing || longestList.length < MAX_INTERACTIONS || e.duration > minLongest.latency) {
        if (existing) {
          existing.latency = Math.max(existing.latency, e.duration);
        } else {
          var interaction = { id: e.interactionId, latency: e.duration };
          longestMap[interaction.id] = interaction;
          longestList.push(interaction);
        }
        longestList.sort(function (a, b) { return b.latency - a.latency; });
        longestList.splice(MAX_INTERACTIONS).forEach(function (i) { delete longestMap[i.id]; });
      }
    }
    var inpEntry = longestList[longestList.length - 1];
    inp = inpEntry ? inpEntry.latency : 0;
  }

  // LCP value
  var lcp = 0;
  if (entry.largestInteractionContentfulPaint) {
    lcp = typeof entry.largestInteractionContentfulPaint === 'number'
      ? entry.largestInteractionContentfulPaint
      : entry.largestInteractionContentfulPaint.renderTime ||
        entry.largestInteractionContentfulPaint.loadTime ||
        entry.largestInteractionContentfulPaint.startTime || 0;
  }

  return [{
    name: entry.name,
    navigationId: navId,
    interactionId: entry.interactionId,
    startTime: Number(entry.startTime.toFixed(0)),
    duration: Number(entry.duration.toFixed(0)),
    firstContentfulPaint: entry.presentationTime
      ? Number(entry.presentationTime.toFixed(0))
      : 0,
    largestInteractionContentfulPaint: Number(lcp.toFixed(0)),
    cumulativeLayoutShift: cls,
    interactionToNextPaint: inp
  }];
})();
