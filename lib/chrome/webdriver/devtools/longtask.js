// https://developer.chrome.com/docs/devtools/performance/extension

export const longtaskTimeLine = `
(function () {
    const observer = new PerformanceObserver(list => { });
    observer.observe({ type: 'longtask', buffered: true,  durationThreshold: 0 });
    const entries = observer.takeRecords();
    for (let entry of entries) {
         performance.measure('Long Task', {
                start: entry.startTime,
                end: entry.startTime + entry.duration, 
                detail: {
                    devtools: {
                        dataType: 'track-entry',
                        track: 'Long Task',
                        trackGroup: 'Browsertime Timeline',
                        color: 'error',
                        tooltipText: 'Long Task'
                    }
                }
            });
    }
})();
`;
