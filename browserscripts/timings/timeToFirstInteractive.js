(function () {
    // Firefox only TTFI
    // need pref to be activated
    // If the "event" has happend, it will return 0
    const timing = window.performance.timing;
    if (timing.timeToFirstInteractive && timing.timeToFirstInteractive > 0) {
        return Number(
            (timing.timeToFirstInteractive - timing.navigationStart).toFixed(0)
        );
    } else return undefined;
})();
