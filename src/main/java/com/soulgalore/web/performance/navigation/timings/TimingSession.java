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
package com.soulgalore.web.performance.navigation.timings;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElementWrapper;
import javax.xml.bind.annotation.XmlRootElement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@XmlRootElement
public class TimingSession
{
    private final Map<String, String> pageData = new HashMap<String, String>();
    private final List<TimingRun> timingRuns = new ArrayList<TimingRun>();
    private final MeasurementStatistics statistics = new MeasurementStatistics();

    public void addPageData(Map<String, String> pageData) {
        this.pageData.putAll(pageData);
    }

    public void addTimingRun(TimingRun run) {
        timingRuns.add(run);
        for (TimingMeasurement measurement : run.getMeasurements()) {
            statistics.addMeasurement(measurement);
        }
    }

    @XmlElementWrapper(name = "pageData")
    public Map<String, String> getPageData() {
        return pageData;
    }

    @XmlElementWrapper(name = "runs")
    @XmlElement(name = "run")
    public List<TimingRun> getTimingRuns() {
        return timingRuns;
    }

    @XmlElement
    public MeasurementStatistics getStatistics() {
        return statistics;
    }
}
