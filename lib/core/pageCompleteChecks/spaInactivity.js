export const spaInactivity = `
return (function(waitTime) {
  const p = window.performance;
  const resourceTimings = p.getEntriesByType('resource');
  if (resourceTimings.length > 0) {
    const lastEntry = resourceTimings.pop();
    const stop = p.now() - lastEntry.responseEnd > waitTime;
    if (stop) {
      // empty resource timings for the next run
      p.clearResourceTimings();
      delete window.__bt_spaQuietSince;
      return true;
    }
    return false;
  }
  // Some SPA navigations render entirely from memory and never make a
  // request. With no resource entries to watch, treat the navigation as
  // done after the same quiet time, counted from the first time this
  // check runs for the navigation.
  if (window.__bt_spaQuietSince === undefined) {
    window.__bt_spaQuietSince = p.now();
    return false;
  }
  if (p.now() - window.__bt_spaQuietSince > waitTime) {
    delete window.__bt_spaQuietSince;
    return true;
  }
  return false;
})(arguments[arguments.length - 1]);
`;
