// https://developer.chrome.com/docs/devtools/performance/extension

export const domCompleteTimeLine = `
(function () {
    performance.mark('DOM Complete', {
        startTime: window.performance.getEntriesByType('navigation')[0].domComplete,
        detail: {
            devtools: {
                dataType: 'marker',
                trackGroup: 'Browsertime Timeline',
                track: 'Metrics',
                color: 'tertiary-dark',
                tooltipText: 'DOM Complete',
                properties: [
                ['DOMComplete', window.performance.getEntriesByType('navigation')[0].domComplete]
                ]
            }
        }
    });
})();
`;
