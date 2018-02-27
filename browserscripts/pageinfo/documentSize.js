(function() {
  const t = window.performance.getEntriesByType('navigation')[0];
  return {
    decodedBodySize: t.decodedBodySize,
    encodedBodySize: t.encodedBodySize,
    transferSize: t.transferSize
  };
})();
