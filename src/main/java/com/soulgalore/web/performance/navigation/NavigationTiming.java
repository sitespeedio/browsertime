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

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlType;

/**
 * Get more interesting information from the Navigation Timing Data.
 * 
 */
// TODO order the timing data as they happens
@XmlType(propOrder = {"DNSLookupTime","basePage","backendTime","frontEndTime","DOMProcessing","domComplete","domInteractive","firstPaint","initialConnection","pageLoad","redirectTime","renderTime","TTFB","usingSPDY", "navigationTimingData"})

public class NavigationTiming {

	private final NavigationTimingData timing;
	private final TestMetaData meta;

	/**
	 * Used when data couldn't be fetched.
	 */
	public static final Long UNKNOWN = new Long(-1);

	public NavigationTiming(TestMetaData meta, NavigationTimingData timing) {

		this.timing = timing;
		this.meta = meta;
	}

	public TestMetaData getMetaData() {
		return meta;
	}

	
	/**
	 * Get all specific timings fetched using the navigation timing API.
	 * @return the raw navigation timing data
	 */
	@XmlElement
	public NavigationTimingData getNavigationTimingData() {
		return timing;
	}

	
	/**
	 * Network data. The time spent on DNS lookup. DNSLookupTime =  domainLookupEnd - domainLookupStart. 
	 * @return the DNS lookup time.
	 */
	@XmlElement
	public long getDNSLookupTime() {
		return timing.getValue("domainLookupEnd")
				- timing.getValue("domainLookupStart");
	}

	
	/**
	 * Network data. The time spent on redirects. RedirectTime = redirectEnd - redirectStart.
	 * @return the redirect time.
	 */
	@XmlElement
	public long getRedirectTime() {
		return timing.getValue("redirectEnd")
				- timing.getValue("redirectStart");
	}

	
	/**
	 * Network data. The time spent in the initial connection. InitialConnection = connectEnd - connectStart.
	 * @return the initial connect time.
	 */
	@XmlElement
	public long getInitialConnection() {
		return timing.getValue("connectEnd") - timing.getValue("connectStart");
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
		return timing.getValue("responseStart") - timing.getValue("connectEnd");
	}

	
	@XmlElement
	/**
	 * Backend time. Total backend time. Total backend = responseStart - navigationStart.
	 * @return the ttfb
	 */
	public long getBackendTime() {
		return timing.getValue("responseStart") - timing.getValue("navigationStart");
	}
	
	/**
	 * Backend time. The base page time. BasePage = responseEnd - responseStart
	 * @return the base page time.
	 */
	@XmlElement
	public long getBasePage() {
		return timing.getValue("responseEnd")
				- timing.getValue("responseStart");
	}


	/**
	 * Frontend time. The time to process the DOM. DOMProcessing = domInteractive - domLoading.
	 * @return
	 */
	@XmlElement
	public long getDOMProcessing() {
		return timing.getValue("domInteractive")
				- timing.getValue("domLoading");
	}

	/**
	 * Frontend time. The time to render. RenderTime = loadEventEnd - domContentLoadedEventStart
	 * @return
	 */
	@XmlElement
	public long getRenderTime() {
		return timing.getValue("loadEventEnd")
				- timing.getValue("domContentLoadedEventStart");
	}
	
	/**
	 * The time spent in front end. FrontEndTime: loadEventStart - responseEnd.
	 * @return
	 */
	@XmlElement
	public long getFrontEndTime() {
		return timing.getValue("loadEventStart")
				- timing.getValue("responseEnd");
	}

	/**
	 * Frontend time. The time for first paint. Will be collected in Chrome & IE. Note that Chrome time is converted to ms.
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

	/**
	 * The time until the DOMInteractive. DOMInteractive = domInteractive - navigationStart.
	 * @return
	 */
	@XmlElement
	public long getDomInteractive() {
		return timing.getValue("domInteractive")
				- timing.getValue("navigationStart");
	}

	/**
	 * DOMComplete time. DOMComplete = domComplete - navigationStart	
	 * @return
	 */
	@XmlElement
	public long getDomComplete() {
		return timing.getValue("domComplete")
				- timing.getValue("navigationStart");
	}

	/**
	 * Get the PageLoad time. PageLoad = loadEventStart - navigationStart.
	 * @return
	 */
	@XmlElement
	public long getPageLoad() {
		return timing.getValue("loadEventStart")
				- timing.getValue("navigationStart");
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
		NavigationTiming other = (NavigationTiming) obj;
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
		return "NavigationTiming [timing=" + timing + ", meta=" + meta
				+ ", getNavigationTimingData()=" + getNavigationTimingData()
				+ ", getDNSLookupTime()=" + getDNSLookupTime()
				+ ", getRedirectTime()=" + getRedirectTime()
				+ ", getInitialConnection()=" + getInitialConnection()
				+ ", getTTFB()=" + getTTFB() + ", getBasePage()="
				+ getBasePage() + ", getDOMProcessing()=" + getDOMProcessing()
				+ ", getRenderTime()=" + getRenderTime()
				+ ", getDomInteractive()=" + getDomInteractive()
				+ ", getDomComplete()=" + getDomComplete()
				+ ", getNavigationAndPageLoad()=" + getPageLoad()
				+ "]";
	}

}
