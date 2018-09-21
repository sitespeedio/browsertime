(function () {
    // Firefox only timeToDOMContentFlushed
    // need pref to be activated
    const timing = window.performance.timing;
    if (timing.timeToDOMContentFlushed) {
            return Number(
                (timing.timeToDOMContentFlushed - timing.navigationStart).toFixed(0)
            );
        }
    else return undefined;
})();
