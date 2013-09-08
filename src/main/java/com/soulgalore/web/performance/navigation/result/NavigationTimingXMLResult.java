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
import com.soulgalore.web.performance.navigation.timings.TimingSession;
import org.apache.commons.math3.stat.descriptive.DescriptiveStatistics;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Marshaller;
import java.io.StringWriter;
import java.util.Date;
import java.util.List;
import java.util.Map;

public class NavigationTimingXMLResult implements NavigationTimingResult {

	@Override
	public String build(Map<String, DescriptiveStatistics> data,
			List<TimingSession> allTimings, NavigationTimingConfiguration conf) {

		// create a new Json structure
		TimingSession timing = allTimings.get(0);
		NavigationTimingInfo realData = new NavigationTimingInfo("", "", "",
				new Date(), allTimings.size(),
                conf);

		for (String metric : data.keySet()) {
			realData.addMetric(new NavigationTimingInfo.Metric(metric, data
					.get(metric).getPercentile(50), data.get(metric).getMean(),
					data.get(metric).getMax(), data.get(metric).getMin(), data
							.get(metric).getPercentile(60), data.get(metric)
							.getPercentile(70), data.get(metric).getPercentile(
							80), data.get(metric).getPercentile(90)));
		}

		JAXBContext jaxbContext;
		try {
			jaxbContext = JAXBContext.newInstance(NavigationTimingInfo.class);
			Marshaller jaxbMarshaller = jaxbContext.createMarshaller();
			jaxbMarshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, true);

			StringWriter st = new StringWriter();
			jaxbMarshaller.marshal(realData, st);
			return st.toString();
		} catch (JAXBException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		return "";

	}
}
