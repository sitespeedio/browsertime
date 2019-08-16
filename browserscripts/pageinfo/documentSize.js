(function() {
  const t = window.performance.getEntriesByType('navigation')[0];
  // Safari doesnt support getEntriesByType('navigation')
  if (t) {
    return {
      decodedBodySize: t.decodedBodySize,
      encodedBodySize: t.encodedBodySize,
      transferSize: t.transferSize
    };
  } else {
    return;
  }
})();
