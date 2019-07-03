(function() {
  if (window.performance.getEntriesByType('navigation').length > 0) {
    return Number(
      window.performance
        .getEntriesByType('navigation')[0]
        .loadEventEnd.toFixed(0)
    );
  } else {
    return Number(
      window.performance.timing.loadEventEnd -
        window.performance.timing.navigationStart
    );
  }
})();
