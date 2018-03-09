'use strict';

module.exports = `
return (function() {
  const timing = window.performance.timing;
  const p = window.performance;
  const limit = 2000;

  if (timing.loadEventEnd === 0) {
    return false;
  }

  let lastEntry = null;
  const resourceTimings = p.getEntriesByType('resource');
  if (resourceTimings.length > 0) {
    lastEntry = resourceTimings.pop();
    // We rely on that we increase the resource timing size
    // but we could also remove timings but then we will
    // break getting resource timings
    // p.clearResourceTimings();
  }

  const loadTime = timing.loadEventEnd - timing.navigationStart;

  if (!lastEntry || lastEntry.responseEnd < loadTime) {
    return p.now() - loadTime > limit;
  } else {
    return p.now() - lastEntry.responseEnd > limit;
  }
})();
`;
