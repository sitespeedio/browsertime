(function() {
  // Firefox only TTFI
  // need pref to be activated
  // If the "event" has happend, it will return 0
  const timing = window.performance.timing;
  if (timing.timeToFirstInteractive && timing.timeToFirstInteractive > 0) {
    const ttfi = Number(
      (timing.timeToFirstInteractive - timing.navigationStart).toFixed(0)
    );
    // We have seen cases when TTFI is - 46 years.
    if (ttfi < 0) {
      return 0;
    } else {
      return ttfi;
    }
  } else return undefined;
})();
