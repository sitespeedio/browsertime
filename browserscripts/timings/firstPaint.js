(function() {
  var firstPaint,
    p = window.performance,
    timing = p.timing,
    entries = p.getEntriesByType('paint');

  if (entries.length > 0) {
    for (var entry of entries) {
      if (entry.name === 'first-paint')
        return Number(entry.startTime.toFixed(0));
    }
  } else if (typeof timing.msFirstPaint === 'number') {
    firstPaint = timing.msFirstPaint - timing.navigationStart;

    if (firstPaint > 0) {
      return Number(firstPaint.toFixed(0));
    }
  } else if (timing.timeToNonBlankPaint) {
    return Number(
      (timing.timeToNonBlankPaint - timing.navigationStart).toFixed(0)
    );
  }

  return undefined;
})();
