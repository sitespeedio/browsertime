package com.soulgalore.web.performance.navigation.metrics;

import java.util.Arrays;
import java.util.List;

/**
 *
 */
public interface Metrics
{
	public static final NamedMetric DNS_LOOKUP_TIME = new IntervalMetric("DNSLookupTime", "", "");
	public static final NamedMetric REDIRECT_TIME = new IntervalMetric("RedirectTime", "", "");
	public static final NamedMetric INITIAL_CONNECTION = new IntervalMetric("InitialConnection", "", "");
	public static final NamedMetric TTFB = new IntervalMetric("TTFB", "", "");
	public static final NamedMetric BASE_PAGE = new IntervalMetric("BasePage", "", "");
	public static final NamedMetric DOM_PROCESSING = new IntervalMetric("DOMProcessing", "", "");
	public static final NamedMetric RENDER_TIME = new IntervalMetric("RenderTime", "", "");
	public static final NamedMetric DOM_INTERACTIVE = new IntervalMetric("DOMInteractive", "", "");
	public static final NamedMetric DOM_COMPLETE = new IntervalMetric("DOMComplete", "", "");
	public static final NamedMetric NAVIGATION_AND_PAGE_LOAD = new IntervalMetric("NavigationAndPageLoad", "", "");
	public static final NamedMetric FIRST_PAINT = new IntervalMetric("FirstPaint", "", "");

	public static final List<NamedMetric> ALL_METRICS = Arrays.asList(DNS_LOOKUP_TIME, REDIRECT_TIME,
		INITIAL_CONNECTION, TTFB, BASE_PAGE, DOM_PROCESSING, RENDER_TIME, DOM_INTERACTIVE, DOM_COMPLETE,
		NAVIGATION_AND_PAGE_LOAD, FIRST_PAINT);
}
