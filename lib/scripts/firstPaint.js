/**
 * Browsertime (http://www.browsertime.com)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var firstPaint = function() {

  var t = window.performance.timing;
  var firstPaint = -1;
  if (window.performance.timing.msFirstPaint) {
    firstPaint = window.performance.timing.msFirstPaint - t.navigationStart;
  } else if (window.chrome && window.chrome.loadTimes) {
    firstPaint = window.chrome.loadTimes().firstPaintTime;

    if (firstPaint !== undefined && firstPaint > 0) {
      firstPaint = (firstPaint * 1000) - t.navigationStart;
    }
  }

  return {
    firstPaint: firstPaint
  };
};
module.exports = firstPaint;