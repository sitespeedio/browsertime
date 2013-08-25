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

import java.util.Map;

import javax.xml.bind.annotation.XmlElement;

/**
 * The raw data from the navigation timing API.
 * 
 */
public class TimingMetrics
{
	public static final String [] IE_EXTRAS = {"msFirstPaint"};
	public static final String [] CHROME_EXTRAS = {"firstPaintTime","wasFetchedViaSpdy","secureConnectionStart"};
	public static final String [] DEFAULT_NAV_TIMINGS = {"connectStart","connectEnd","domComplete","domContentLoadedEventEnd","domContentLoadedEventStart","domInteractive","domLoading","domainLookupStart","domainLookupEnd","fetchStart","loadEventStart","loadEventEnd",
	"navigationStart","redirectEnd","redirectStart","requestStart","responseEnd","responseStart","unloadEventEnd","unloadEventStart"};

	
	@XmlElement
	private final Map<String, Long> timings;
	
	
	public TimingMetrics(Map<String, Long> timings) {
		this.timings = timings;
	}

	public Map<String, Long> getTimings() {
		return timings;
	}

	public Long getValue(String timing) {
		return timings.get(timing);
	}

	public boolean contains(String timing) {
		return timings.containsKey(timing);
	}
}
