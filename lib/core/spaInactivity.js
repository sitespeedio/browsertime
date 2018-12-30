'use strict';

module.exports = `
return (function(waitTime) {
  const timing = window.performance.timing;
  const p = window.performance;
  const resourceTimings = p.getEntriesByType('resource');
  if (resourceTimings.length > 0) {
    const lastEntry = resourceTimings.pop();
    return p.now() - lastEntry.responseEnd > waitTime;
  }
  else return false;
})(arguments[arguments.length - 1]);
`;
