package net.browsertime.tool.datacollector;

enum NavigationTimingAttribute {
  navigationStart, unloadEventStart, unloadEventEnd, redirectStart, redirectEnd, fetchStart,
  domainLookupStart, domainLookupEnd, connectStart, connectEnd, secureConnectionStart,
  requestStart, responseStart, responseEnd, domLoading, domInteractive,
  domContentLoadedEventStart, domContentLoadedEventEnd, domComplete, loadEventStart, loadEventEnd
}
