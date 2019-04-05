(function() {
  return Number(
    window.performance.getEntriesByType('navigation')[0].loadEventEnd.toFixed(0)
  );
})();
