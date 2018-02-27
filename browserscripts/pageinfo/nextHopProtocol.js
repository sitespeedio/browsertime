(function() {
  const t = window.performance.getEntriesByType('navigation')[0];
  return t.nextHopProtocol;
})();
