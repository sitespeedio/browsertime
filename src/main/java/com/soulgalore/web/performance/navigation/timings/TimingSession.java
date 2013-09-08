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

import javax.xml.bind.annotation.XmlElementWrapper;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class TimingSession
{
    private final Map<String, String> pageData = new HashMap<String, String>();
    private final List<TimingRun> timingRuns = new ArrayList<TimingRun>();

    public void addPageData(Map<String, String> pageData) {
        this.pageData.putAll(pageData);
    }

    public void addTimingRun(TimingRun run) {
        timingRuns.add(run);
    }

    @XmlElementWrapper(name = "pageData")
    public Map<String, String> getPageData() {
        return pageData;
    }

    @XmlElementWrapper(name = "runs")
    public List<TimingRun> getTimingRuns() {
        return timingRuns;
    }
}
