(function () {
    let t = window.performance.getEntriesByType('navigation')[0];
    if (t) {
        return t.responseStart.toFixed(0)
    } else {
        return window.performance.timing.responseStart.toFixed(0) - window.performance.timing.navigationStart.toFixed(0);
    }
})();
