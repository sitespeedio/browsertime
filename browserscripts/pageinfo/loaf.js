(function () {
  // See https://developer.chrome.com/docs/web-platform/long-animation-frames
  if (
    PerformanceObserver.supportedEntryTypes.includes('long-animation-frame')
  ) {
    const MAX_LOAFS_TO_CONSIDER = 10;
    const relevantLoadEntries = [];
    const observer = new PerformanceObserver(list => {});
    observer.observe({type: 'long-animation-frame', buffered: true});
    const entries = observer.takeRecords();

    let longestBlockingLoAFs = []
      .concat(entries)
      .sort((a, b) => b.blockingDuration - a.blockingDuration)
      .slice(0, MAX_LOAFS_TO_CONSIDER);

    // re-package
    for (let entry of longestBlockingLoAFs) {
      const info = {};
      info.blockingDuration = entry.blockingDuration;
      info.duration = entry.duration;
      info.styleAndLayoutStart = entry.styleAndLayoutStart;
      info.renderStart = entry.renderStart;
      info.workDuration = entry.renderStart ? entry.renderStart - entry.startTime : entry.duration;
      info.renderDuration = entry.renderStart ? (entry.startTime + entry.duration) - entry.renderStart: 0;
      info.preLayoutDuration =  entry.styleAndLayoutStart ? entry.styleAndLayoutStart - entry.renderStart : 0;
      info.styleAndLayoutDuration = entry.styleAndLayoutStart ? (entry.startTime + entry.duration) - entry.styleAndLayoutStart : 0
      
      info.scripts = [];
      for (let script of entry.scripts) {
        const s = {};
        s.forcedStyleAndLayoutDuration = script.forcedStyleAndLayoutDuration;
        s.invoker = script.invoker;
        s.invokerType = script.invokerType;
        s.sourceFunctionName = script.sourceFunctionName;
        s.sourceURL = script.sourceURL;
        s.sourceCharPosition = script.sourceCharPosition;
        s.windowAttribution = script.windowAttribution;
        info.scripts.push(s);
      }
      relevantLoadEntries.push(info);
    }
    return relevantLoadEntries;
  }
})();
