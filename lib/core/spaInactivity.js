'use strict';

module.exports = `
return (function(waitTime) {
  const timing = window.performance.timing;
  const p = window.performance;
  const resourceTimings = p.getEntriesByType('resource');
  if (resourceTimings.length > 0) {
    const lastEntry = resourceTimings.pop();
    const stop = p.now() - lastEntry.responseEnd > waitTime;
    if (stop) {
      // empty resource timings for the next run
      p.clearResourceTimings();
      return true;
    }
  }
  else return false;
})(arguments[arguments.length - 1]);
`;
