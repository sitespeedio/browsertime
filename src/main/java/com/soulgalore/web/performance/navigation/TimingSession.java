/******************************************************
 * Navigation timing
 * 
 *
 * Copyright (C) 2013 by Peter Hedenskog (http://peterhedenskog.com)
 *
 ******************************************************
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in 
 * compliance with the License. You may obtain a copy of the License at
 * 
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is 
 * distributed  on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.   
 * See the License for the specific language governing permissions and limitations under the License.
 *
 *******************************************************
 */
package com.soulgalore.web.performance.navigation;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.xml.bind.annotation.XmlElement;

import org.apache.commons.math3.stat.descriptive.DescriptiveStatistics;

import com.soulgalore.web.performance.navigation.metrics.Metrics;
import com.soulgalore.web.performance.navigation.metrics.NamedMetric;

/**
 * Get more interesting information from the Navigation Timing Data.
 * 
 */
public class TimingSession
{
	private final Map<NamedMetric, DescriptiveStatistics> statistics;

	private final TimingMetrics timing;
	private final TestMetaData meta;

	private boolean keepAllTimings;
	private List<TimingMetrics> allTimings;

	public static final Long UNKNOWN = -1l;

	public TimingSession(TestMetaData meta, TimingMetrics timing) {
		this(meta, timing, false);
	}

	public TimingSession(TestMetaData meta, TimingMetrics timing, boolean keepAllTimings) {
		this.timing = timing;
		this.meta = meta;
		this.keepAllTimings = keepAllTimings;
		if (keepAllTimings)
		{
			allTimings = new ArrayList<TimingMetrics>();
		}
		this.statistics = new HashMap<NamedMetric, DescriptiveStatistics>();
	}

	public void addTiming(TimingMetrics timing)
	{
		if (keepAllTimings)
		{
			allTimings.add(timing);
		}

		updateStatistics(timing);
	}

	public TestMetaData getMetaData() {
		return meta;
	}

	private void updateStatistics(TimingMetrics timing)
	{
		for (NamedMetric metric : Metrics.ALL_METRICS)
		{
			DescriptiveStatistics s = getStatistics(metric);
			s.addValue(metric.calculateMetric(timing));
		}
	}

	private DescriptiveStatistics getStatistics(NamedMetric metric)
	{
		DescriptiveStatistics s = statistics.get(metric);
		if (s == null) {
			s = new DescriptiveStatistics();
			statistics.put(metric, s);
		}
		return s;
	}


	/**
	 * Get all specific timings fetched using the navigation timing API.
	 * @return the raw navigation timing data
	 */
	@XmlElement
	public TimingMetrics getNavigationTimingData() {
		return timing;
	}

	
	/**
	 * Network data. The time spent on DNS lookup. DNSLookupTime =  domainLookupEnd - domainLookupStart. 
	 * @return the DNS lookup time.
	 */
	@XmlElement
	public long getDNSLookupTime() {
		return getTimeBetweenEvents("domainLookupStart", "domainLookupEnd");
	}

	
	/**
	 * Network data. The time spent on redirects. RedirectTime = redirectEnd - redirectStart.
	 * @return the redirect time.
	 */
	@XmlElement
	public long getRedirectTime() {
		return getTimeBetweenEvents("redirectStart", "redirectEnd");
	}

	
	/**
	 * Network data. The time spent in the initial connection. InitialConnection = connectEnd - connectStart.
	 * @return the initial connect time.
	 */
	@XmlElement
	public long getInitialConnection() {
		return getTimeBetweenEvents("connectStart", "connectEnd");
	}

	/**
	 * Network data. Is page fetched using SPDY? The check only works for Chrome.
	 * @return 1 if SPDY is used, else 0. If unknown, {@value #UNKNOWN} is returned.
	 */
	@XmlElement
	public long getUsingSPDY() {
		if (timing.contains("wasFetchedViaSpdy"))
			return timing.getValue("wasFetchedViaSpdy");
		else
			return UNKNOWN;
	}

	
	@XmlElement
	/**
	 * Backend time. The time to first byte. TTFB = responseStart - connectEnd.
	 * @return the ttfb
	 */
	public long getTTFB() {
		return getTimeBetweenEvents("connectEnd", "responseStart");
	}

	
	/**
	 * Backend time. The base page time. BasePage = responseEnd - responseStart
	 * @return the base page time.
	 */
	@XmlElement
	public long getBasePage() {
		return getTimeBetweenEvents("responseStart", "responseEnd");
	}

	// Frontend
	@XmlElement
	public long getDOMProcessing() {
		return getTimeBetweenEvents("domLoading", "domInteractive");
	}

	@XmlElement
	public long getRenderTime() {
		return getTimeBetweenEvents("domContentLoadedEventStart", "loadEventEnd");
	}

	// will fetch first paint for IE & Chrome in ms
	/**
	 * Front end time. The time for first paint. Will be collected in Chrome & IE. Note that Chrome time is converted to ms.
	 * @return time to first paint in milliseconds
	 */
	@XmlElement
	public long getFirstPaint() {
		if (timing.contains("msFirstPaint"))
			return timing.getValue("msFirstPaint");
		else if (timing.contains("firstPaintTime"))
			return timing.getValue("firstPaintTime")
					- timing.getValue("navigationStart");
		else
			return UNKNOWN;
	}

	// important timings
	@XmlElement
	public long getDomInteractive() {
		return getTimeBetweenEvents("navigationStart", "domInteractive");
	}

	@XmlElement
	public long getDomComplete() {
		return getTimeBetweenEvents("navigationStart", "domComplete");
	}

	@XmlElement
	public long getNavigationAndPageLoad() {
		return getTimeBetweenEvents("navigationStart", "loadEventStart");
	}

	private long getTimeBetweenEvents(String startPoint, String endPoint)
	{
		return timing.getValue(endPoint) - timing.getValue(startPoint);
	}

	private long getTimeBetweenEvents(TimingMetrics timing, String startPoint, String endPoint)
	{
		return timing.getValue(endPoint) - timing.getValue(startPoint);
	}

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((meta == null) ? 0 : meta.hashCode());
		result = prime * result + ((timing == null) ? 0 : timing.hashCode());
		return result;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		TimingSession other = (TimingSession) obj;
		if (meta == null) {
			if (other.meta != null)
				return false;
		} else if (!meta.equals(other.meta))
			return false;
		if (timing == null) {
			if (other.timing != null)
				return false;
		} else if (!timing.equals(other.timing))
			return false;
		return true;
	}

	@Override
	public String toString() {
		return "TimingSession [timing=" + timing + ", meta=" + meta
				+ ", getNavigationTimingData()=" + getNavigationTimingData()
				+ ", getDNSLookupTime()=" + getDNSLookupTime()
				+ ", getRedirectTime()=" + getRedirectTime()
				+ ", getInitialConnection()=" + getInitialConnection()
				+ ", getTTFB()=" + getTTFB()
				+ ", getBasePage()=" + getBasePage()
				+ ", getDOMProcessing()=" + getDOMProcessing()
				+ ", getRenderTime()=" + getRenderTime()
				+ ", getDomInteractive()=" + getDomInteractive()
				+ ", getDomComplete()=" + getDomComplete()
				+ ", getNavigationAndPageLoad()=" + getNavigationAndPageLoad()
				+ "]";
	}

}
