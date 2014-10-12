// fetch the data we want from the different timing API:s


var timings = function() {
  var t = window.performance.timing;

  return {
    timings: {
      domainLookupTime: (t.domainLookupEnd - t.domainLookupStart),
      redirectionTime: (t.fetchStart - t.navigationStart),
      serverConnectionTime: (t.connectEnd - t.requestStart),
      serverResponseTime: (t.responseEnd - t.requestStart),
      pageDownloadTime: (t.responseEnd - t.responseStart),
      domInteractiveTime: (t.domInteractive - t.navigationStart),
      domContentLoadedTime: (t.domContentLoadedEventStart - t.navigationStart),
      pageLoadTime: (t.loadEventStart - t.navigationStart),
      frontEndTime: (t.loadEventStart - t.responseEnd),
      backEndTime: (t.responseStart - t.navigationStart)
    }
  };
};
module.exports = timings;