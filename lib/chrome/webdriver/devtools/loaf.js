// Adopted from https://github.com/andydavies/perf-timeline-to-devtools-profile
// https://developer.chrome.com/docs/devtools/performance/extension

export const loafTimeLine = `
(function () {
    const observer = new PerformanceObserver(list => { });
    observer.observe({ type: 'long-animation-frame', buffered: true,  durationThreshold: 0 });
    const entries = observer.takeRecords();
    for (let entry of entries) {
         
            // Set script entries before LoAF so Chrome can display them in the right order
            for(const script of entry.scripts) {
                performance.measure('script', {
                    start: script.startTime,
                    end: script.startTime + script.duration, 
                    detail: {
                        devtools: {
                        dataType: 'track-entry',
                        track: 'LoAF',
                        trackGroup: 'Browsertime Timeline',
                        color: 'secondary',
                        tooltipText: script.sourceURL
                        }
                    }
                });
            }

            performance.measure('LoAF', {
              start: entry.startTime,
              end: entry.startTime + entry.duration, 
              detail: {
                devtools: {
                  dataType: 'track-entry',
                  track: 'LoAF',
                  trackGroup: 'Browsertime Timeline',
                  color: 'primary',
                  tooltipText: 'LoAF'
                }
              }
            });

            if(entry.styleAndLayoutStart > 0) {
                performance.measure('Layout + Paint', {
                    start: entry.styleAndLayoutStart,
                    end: entry.startTime + entry.duration, 
                    detail: {
                    devtools: {
                        
                        dataType: 'track-entry',
                        track: 'LoAF',
                        trackGroup: 'Browsertime Timeline',
                        color: 'secondary-light',
                        tooltipText: 'Layout + Paint'
                    }
                    }
                });
            }
    }
})();
`;
