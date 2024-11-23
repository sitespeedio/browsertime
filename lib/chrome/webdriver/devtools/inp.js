// Adopted from https://github.com/andydavies/perf-timeline-to-devtools-profile
// https://developer.chrome.com/docs/devtools/performance/extension

export const inpTimeLine = `
(function() {
    const observer = new PerformanceObserver(list => {});
    for (const type of ['event']) {
        observer.observe({ type, buffered: true, durationThreshold: 0});
    }
    let inpEventCount = 0;
    const entries = observer.takeRecords();
    for (const entry of entries) {
        if(entry.entryType == 'event' && entry.interactionId > 0) {
            inpEventCount++;
            performance.measure('Input Delay', {
                start: entry.startTime,
                end: entry.processingStart, 
                detail: {
                    devtools: {
                        dataType: 'track-entry',
                        track: 'INP.' + inpEventCount,
                        trackGroup: 'Browsertime Timeline',
                        color: 'primary',
                        tooltipText: 'Input Delay',
                        properties: [
                            ['name', '' + entry.name],
                            ['target', '' + entry.target.tagName]
                        ]
                    }
                }
            });
            performance.measure('Processing Time', {
                start: entry.processingStart,
                end: entry.processingEnd, 
                detail: {
                    devtools: {
                        
                        dataType: 'track-entry',
                        track: 'INP.' + inpEventCount,
                        trackGroup: 'Browsertime Timeline',
                        color: 'primary',
                        tooltipText: 'Processing Time',
                        properties: [
                            ['name', '' + entry.name],
                            ['target', '' + entry.target.tagName]
                        ]
                    }
                }
            });
            performance.measure('Presentation Delay', {
                start: entry.processingEnd,
                end: entry.startTime + entry.duration, 
                detail: {
                    devtools: {
                        dataType: 'track-entry',
                        track: 'INP.' + inpEventCount,
                        trackGroup: 'Browsertime Timeline',
                        color: 'primary',
                        tooltipText: 'Presentation Delay',
                        properties: [
                            ['name', '' + entry.name],
                            ['target', '' + entry.target.tagName]
                        ]
                    }
                }
            });
        }                 
    }
  })();
`;
