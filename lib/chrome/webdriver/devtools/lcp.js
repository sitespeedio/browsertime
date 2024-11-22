// https://developer.chrome.com/docs/devtools/performance/extension

export const lcpTimeLine = `
(function () {
    const observer = new PerformanceObserver(list => { });
    observer.observe({ type: 'largest-contentful-paint', buffered: true, durationThreshold: 0, includeSoftNavigationObservations: true });
    const entries = observer.takeRecords();
    entries.forEach((entry, index) => {
        if (index === entries.length - 1) {
            // This is the LCP
            performance.mark('LCP', {
                startTime: Math.max(entry.renderTime, entry.loadTime),
                detail: {
                    devtools: {
                        dataType: 'marker',
                        track: 'Metrics',
                        trackGroup: 'Browsertime Timeline',
                        color: 'primary-dark',
                        tooltipText: 'LCP ' + entry.element ? entry.element.className : '',
                        properties: [
                            ['size', '' + entry.size],
                            ['tagName', '' + entry.element ? entry.element.tagName : ''],
                            ['className', '' + entry.element ? entry.element.className : ''],
                            ['URL', '' + entry.url],
                            ['Render', Math.max(entry.renderTime, entry.loadTime)]
                        ],
                    }
                }
            });
        } else {
            // LCP candidates
            performance.mark('LCP candidate', {
                startTime: Math.max(entry.renderTime, entry.loadTime),
                detail: {
                    devtools: {
                        dataType: 'marker',
                        track: 'LCP',
                        trackGroup: 'Browsertime Timeline',
                        color: 'primary-dark',
                        tooltipText: 'LCP Candidate ' + entry.element ? entry.element.className : '',
                        properties: [
                            ['size', '' + entry.size],
                            ['tagName', '' + entry.element ? entry.element.tagName : ''],
                            ['className', '' + entry.element ? entry.element.className : ''],
                            ['URL', '' + entry.url]
                        ],
                    }
                }
            });
        }
    });
})();
`;
