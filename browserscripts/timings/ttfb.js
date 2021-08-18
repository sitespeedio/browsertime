(function () {
    let t = window.performance.getEntriesByType('navigation')[0];
    if (t) {
        return Number(t.responseStart.toFixed(0));
    } else {
        return Number(window.performance.timing.responseStart.toFixed(0) - window.performance.timing.navigationStart.toFixed(0));
    }
})();
