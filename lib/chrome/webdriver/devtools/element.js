// https://developer.chrome.com/docs/devtools/performance/extension

export const elementTimeLine = `
(function () {
    const observer = new PerformanceObserver(list => { });
    observer.observe({ type: 'element', buffered: true });
    const entries = observer.takeRecords();
    for (let entry of entries) {
        performance.mark(entry.identifier, {
            startTime: entry.renderTime,
            detail: {
                devtools: {
                dataType: 'marker',
                track: 'Metrics',
                trackGroup: 'Browsertime Timeline',
                color: 'primary',
                tooltipText: entry.identifier + ' element',
                properties: [
                    ['tagName', '' + entry.element ? entry.element.tagName:''],
                    ['className', '' + entry.element ? entry.element.className:''],
                    ['URL', '' + entry.url]
                    ['Render', entry.renderTime]
                    ],
                }
            }
        });
    }
})();
`;
