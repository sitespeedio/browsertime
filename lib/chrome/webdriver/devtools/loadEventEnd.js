// https://developer.chrome.com/docs/devtools/performance/extension

export const loadEventEndTimeLine = `
(function () {
    performance.mark('Load Event End', {
        startTime: performance.getEntriesByType('navigation')[0].loadEventEnd,
        detail: {
            devtools: {
                dataType: 'marker',
                trackGroup: 'Browsertime Timeline',
                track: 'Metrics',
                color: 'secondary',
                tooltipText: 'Load Event End',
                properties: [
                 ['LoadEventEnd', window.performance.getEntriesByType('navigation')[0].loadEventEnd]
                ]
            }
        }
    });
})();
`;
