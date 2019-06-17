'use strict';

module.exports = `
return (function(waitTime) {
  const timing = window.performance.timing;
  const p = window.performance;
  const limit = waitTime;

  if (timing.loadEventEnd === 0) {
    return false;
  }

  let lastEntry = null;
  const resourceTimings = p.getEntriesByType('resource');
  if (resourceTimings.length > 0) {
    lastEntry = resourceTimings.pop();
    // This breaks getting resource timings so ...
    p.clearResourceTimings();
  }

  const loadTime = timing.loadEventEnd - timing.navigationStart;

  if (!lastEntry || lastEntry.responseEnd < loadTime) {
    return p.now() - loadTime > limit;
  } else {
    return p.now() - lastEntry.responseEnd > limit;
  }
})(arguments[arguments.length - 1]);
`;
