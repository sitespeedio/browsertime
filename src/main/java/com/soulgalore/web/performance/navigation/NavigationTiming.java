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

/**
 * Get more interesting information from the Navigation Timing Data.
 * 
 */
public class NavigationTiming {

	private final NavigationTimingData timing;
	private final TestMetaData meta;

	public static final Long UNKNOWN = new Long(-1);

	public NavigationTiming(TestMetaData meta, NavigationTimingData timing) {

		this.timing = timing;
		this.meta = meta;
	}

	public TestMetaData getMetaData() {
		return meta;
	}

	@XmlElement
	public NavigationTimingData getNavigationTimingData() {
		return timing;
	}

	// Network data
	@XmlElement
	public long getDNSLookupTime() {
		return timing.getValue("domainLookupEnd")
				- timing.getValue("domainLookupStart");
	}

	@XmlElement
	public long getRedirectTime() {
		return timing.getValue("redirectEnd")
				- timing.getValue("redirectStart");
	}

	@XmlElement
	public long getInitialConnection() {
		return timing.getValue("connectEnd") - timing.getValue("connectStart");
	}

	@XmlElement
	public long getUsingSPDY() {
		if (timing.contains("wasFetchedViaSpdy"))
			return timing.getValue("wasFetchedViaSpdy");
		else
			return UNKNOWN;
	}

	// Backend
	@XmlElement
	public long getTTFB() {
		return timing.getValue("responseStart") - timing.getValue("connectEnd");
	}

	@XmlElement
	public long getBasePage() {
		return timing.getValue("responseEnd")
				- timing.getValue("responseStart");
	}

	// Frontend
	@XmlElement
	public long getDOMProcessing() {
		return timing.getValue("domInteractive")
				- timing.getValue("domLoading");
	}

	@XmlElement
	public long getRenderTime() {
		return timing.getValue("loadEventEnd")
				- timing.getValue("domContentLoadedEventStart");
	}

	// will fetch first paint for IE & Chrome in ms
	@XmlElement
	public long getFirstPaint() {
		if (timing.contains("msFirstPaint"))
			return timing.getValue("msFirstPaint");
		else if (timing.contains("firstPaintTime"))
			return timing.getValue("firstPaintTime");
		else
			return UNKNOWN;
	}

	// important timings
	@XmlElement
	public long getDomInteractive() {
		return timing.getValue("domInteractive")
				- timing.getValue("navigationStart");
	}

	@XmlElement
	public long getDomComplete() {
		return timing.getValue("domComplete")
				- timing.getValue("navigationStart");
	}

	@XmlElement
	public long getNavigationAndPageLoad() {
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
				+ ", getNavigationAndPageLoad()=" + getNavigationAndPageLoad()
				+ "]";
	}

}
