(function() {
  if (window.__bt_longtask) {
    const cleaned = [];
    for (let event of window.__bt_longtask.e) {
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
        a.duration = at.duration;
        a.name = at.name;
        a.startTime = at.name;
        e.attribution.push(a);
      }
      cleaned.push(e);
    }

    return cleaned;
  }
})();
