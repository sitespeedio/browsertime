(function () {
    // Firefox only timeToContentfulPaint
    // need pref to be activated
    const timing = window.performance.timing;
    if (timing.timeToContentfulPaint) {
            return Number(
                (timing.timeToContentfulPaint - timing.navigationStart).toFixed(0)
            );
        }
    else return undefined;
})();
