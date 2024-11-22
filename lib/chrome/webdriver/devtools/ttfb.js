// https://developer.chrome.com/docs/devtools/performance/extension

export const ttfbTimeLine = `
(function () {
    performance.mark('TTFB', {
        startTime: window.performance.getEntriesByType('navigation')[0].responseStart,
        detail: {
            devtools: {
                dataType: 'marker',
                trackGroup: 'Browsertime Timeline',
                track: 'Metrics',
                color: 'tertiary-light',
                tooltipText: 'Time To First Byte (TTFB)',
                properties: [
                 ['TTFB', window.performance.getEntriesByType('navigation')[0].responseStart]
                ]
            }
        }
    });
})();
`;
