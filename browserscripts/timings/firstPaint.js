(function() {
  var firstPaint, timing = window.performance.timing;

  if (window.chrome && window.chrome.loadTimes) {
    var loadTimes = window.chrome.loadTimes();
    firstPaint = (loadTimes.firstPaintTime - loadTimes.requestTime) * 1000;

    if (firstPaint > 0) {
      return Number(firstPaint.toFixed(0));
    }
  } else if (typeof timing.msFirstPaint === 'number') {
    firstPaint = timing.msFirstPaint - timing.navigationStart;

    if (firstPaint > 0) {
      return firstPaint;
    }
  }

  return undefined;
})();
