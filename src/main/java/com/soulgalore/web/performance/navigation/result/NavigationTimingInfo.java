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
package com.soulgalore.web.performance.navigation.result;

import com.soulgalore.web.performance.navigation.run.NavigationTimingConfiguration;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

/**
 * Info class used for output. The 
 *
 */
@XmlRootElement(name = "navigation-timing")
class NavigationTimingInfo {
	private String url;
	private String browser;
	private String browserVersion;
	private Date when;
	private int runs;
	private Set<Metric> metrics = new HashSet<Metric>();

    /**
	 * Only to satisfy the Marshaller.
	 */
	public NavigationTimingInfo() {

	}

	NavigationTimingInfo(String url, String browser, String browserVersion, Date when,
                         int runs, NavigationTimingConfiguration conf) {
		super();
		this.url = url;
		this.browser = browser;
		this.browserVersion = browserVersion;
		this.when = when;
		this.runs = runs;

		if (conf.includeIndividualRuns()) {
        }
	}

	@XmlElement
	public String getUrl() {
		return url;
	}

	@XmlElement
	public String getBrowser() {
		return browser;
	}

	@XmlElement
	public String getBrowserVersion() {
		return browserVersion;
	}

	@XmlElement
	public Date getWhen() {
		return when;
	}

	@XmlElement
	public int getRuns() {
		return runs;
	}

	@XmlElement
	public Set<Metric> getMetrics() {
		return metrics;
	}

    void addMetric(Metric metric) {
		metrics.add(metric);
	}

	static class Metric {

		private String name;
		private Double median;
		private Double avg;
		private Double max;
		private Double min;
		private Double p60;
		private Double p70;
		private Double p80;
		private Double p90;

		Metric(String name, Double median, Double avg, Double max,
				Double min, Double p60, Double p70, Double p80, Double p90) {
			this.name = name;
			this.median = median;
			this.avg = avg;
			this.max = max;
			this.min = min;
			this.p60 = p60;
			this.p70 = p70;
			this.p80 = p80;
			this.p90 = p90;
		}

		@XmlElement
		String getName() {
			return name;
		}

		@XmlElement
		Double getMedian() {
			return median;
		}

		@XmlElement
		Double getAvg() {
			return avg;
		}

		@XmlElement
		Double getMax() {
			return max;
		}

		@XmlElement
		Double getMin() {
			return min;
		}

		@XmlElement
		Double getP60() {
			return p60;
		}

		@XmlElement
		Double getP70() {
			return p70;
		}

		@XmlElement
		Double getP80() {
			return p80;
		}

		@XmlElement
		Double getP90() {
			return p90;
		}

	}

}
