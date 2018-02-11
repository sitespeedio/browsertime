(function() {
  var firstPaint,
    p = window.performance,
    timing = p.timing,
    entries = p.getEntriesByType('paint');
  
    if (entries.length > 0) {
      for (var entry of entries) {
        if (entry.name === 'first-paint')
        return entry.startTime;
      }
     } else if (typeof timing.msFirstPaint === 'number') {
    firstPaint = timing.msFirstPaint - timing.navigationStart;

    if (firstPaint > 0) {
      return firstPaint;
    }
  } else if (timing.timeToNonBlankPaint) {
    return timing.timeToNonBlankPaint - timing.navigationStart;
  }

  return undefined;
})();
