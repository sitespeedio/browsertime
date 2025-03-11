(function () {
    let t = window.performance.getEntriesByType('navigation')[0];
    const serverTimings = [];
    for (let timing of t.serverTiming) {
        serverTimings.push({
            name: timing.name,
            duration: timing.duration,
            description: timing.description
        });
    }
    return serverTimings;
})();
