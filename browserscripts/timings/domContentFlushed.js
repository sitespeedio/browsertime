(function () {
    // Firefox only timeToDOMContentFlushed
    const timing = window.performance.timing;
   if (timing.timeToDOMContentFlushed) {
        return Number(
            (timing.timeToDOMContentFlushed - timing.navigationStart).toFixed(0)
        );
    }
    else return undefined;
})();
