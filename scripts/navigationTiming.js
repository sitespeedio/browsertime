/**
 * Browsertime (http://www.browsertime.com)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */

var t = window.performance.timing;
return {
	navigationStart: 0,
	unloadEventStart: (t.unloadEventStart === 0) ? 0 : t.unloadEventStart - t.navigationStart,
	unloadEventEnd:  (t.unloadEventEnd === 0) ? 0 : t.unloadEventEnd - t.navigationStart,
	redirectStart: (t.redirectStart === 0) ? 0 : t.redirectStart - t.navigationStart,
	redirectEnd: (t.redirectEnd === 0) ? 0 : t.redirectEnd - t.navigationStart,
	fetchStart: t.fetchStart - t.navigationStart,
	domainLookupStart: t.domainLookupStart - t.navigationStart,
	domainLookupEnd: t.domainLookupEnd - t.navigationStart,
	connectStart: t.connectStart - t.navigationStart,
	connectEnd: t.connectEnd - t.navigationStart,
	secureConnectionStart: (t.secureConnectionStart === 0) ? 0 : t.secureConnectionStart - t.navigationStart,
	requestStart: t.requestStart - t.navigationStart,
	responseStart: t.responseStart - t.navigationStart,
	responseEnd: t.responseEnd - t.navigationStart,
	domLoading: t.domLoading - t.navigationStart,
	domInteractive: t.domInteractive - t.navigationStart,
	domContentLoadedEventStart: t.domContentLoadedEventStart - t.navigationStart,
	domContentLoadedEventEnd: t.domContentLoadedEventEnd - t.navigationStart,
	domComplete: t.domComplete - t.navigationStart,
	loadEventStart: t.loadEventStart - t.navigationStart,
	loadEventEnd: t.loadEventEnd - t.navigationStart
};
