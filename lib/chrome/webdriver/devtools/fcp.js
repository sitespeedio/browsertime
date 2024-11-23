// https://developer.chrome.com/docs/devtools/performance/extension

export const fcpTimeLine = `
(function () {
    const observer = new PerformanceObserver(list => { });
    observer.observe({ type: 'paint', buffered: true });
    const entries = observer.takeRecords();
    for (let entry of entries) {
        performance.mark(entry.name === 'first-contentful-paint' ? 'FCP': 'FP', {
            startTime: entry.startTime,
            detail: {
                devtools: {
                dataType: 'marker',
                track: 'Metrics',
                trackGroup: 'Browsertime Timeline',
                color: 'primary',
                tooltipText: entry.name
                }
            }
        });
    }
})();
`;
