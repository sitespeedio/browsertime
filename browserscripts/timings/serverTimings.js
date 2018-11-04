(function () {
    // https://developer.mozilla.org/en-US/docs/Web/API/PerformanceServerTiming
    const entries = window.performance.getEntriesByType('resource');
    if (entries.length > 0 && entries[0].serverTiming) {
        const timings = entries[0].serverTiming;
        const serverTimings = [];
        for (let timing of timings) {
             serverTimings.push({
                 name: timing.name,
                 duration: timing.duration,
                 description: timing.description
             });
        }
        return serverTimings;
    } else return undefined;
})();
