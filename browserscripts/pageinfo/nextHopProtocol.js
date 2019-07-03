(function() {
  const t = window.performance.getEntriesByType('navigation')[0];
  // Not supported in Safari
  if (t) {
    return t.nextHopProtocol;
  }
})();
