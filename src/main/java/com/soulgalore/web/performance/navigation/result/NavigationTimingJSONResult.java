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

import java.util.List;
import java.util.Map;

import org.apache.commons.math3.stat.descriptive.DescriptiveStatistics;

import com.google.gson.Gson;
import com.soulgalore.web.performance.navigation.NavigationTiming;
import com.soulgalore.web.performance.navigation.run.NavigationTimingConfiguration;

public class NavigationTimingJSONResult implements NavigationTimingResult {

	@Override
	public String build(Map<String, DescriptiveStatistics> data,
			List<NavigationTiming> allTimings, NavigationTimingConfiguration conf) {

		// create a new Json structure
		NavigationTimingInfo realData = new NavigationTimingInfo(allTimings
				.get(0).getMetaData().getURL(), allTimings.get(0).getMetaData()
				.getBrowser(), allTimings.get(0).getMetaData()
				.getBrowserVersion(),
				allTimings.get(0).getMetaData().getWhen(), allTimings.size(),
				allTimings, conf);

		for (String metric : data.keySet()) {
			realData.addMetric(new NavigationTimingInfo.Metric(metric, data
					.get(metric).getPercentile(50), data.get(metric).getMean(),
					data.get(metric).getMax(), data.get(metric).getMin(), data
							.get(metric).getPercentile(60), data.get(metric)
							.getPercentile(70), data.get(metric).getPercentile(
							80), data.get(metric).getPercentile(90)));
		}

		Gson gson = new Gson();
		return gson.toJson(realData);

	}

}
