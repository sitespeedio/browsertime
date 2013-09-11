 /*******************************************************************************************************************************
 * It's Browser Time!
 * 
 *
 * Copyright (C) 2013 by Tobias Lidskog (https://twitter.com/tobiaslidskog) &  Peter Hedenskog (http://peterhedenskog.com)
 *
 ********************************************************************************************************************************
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
 ********************************************************************************************************************************
 */
package com.soulgalore.web.performance.navigation.timings;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElementWrapper;
import java.util.*;

public class TimingRun {
    private final Map<String, TimingMark> marks = new HashMap<String, TimingMark>();
    private final List<TimingMeasurement> measurements = new ArrayList<TimingMeasurement>();

    public void addMark(TimingMark mark) {
        marks.put(mark.getName(), mark);
    }

    public TimingMark getMark(String name) {
        return marks.get(name);
    }

    @XmlElementWrapper(name = "marks")
    @XmlElement(name = "mark")
    public Collection<TimingMark> getMarks() {
        return Collections.unmodifiableCollection(marks.values());
    }

    public void addMeasurement(TimingMeasurement measurement) {
        measurements.add(measurement);
    }

    @XmlElementWrapper(name = "measurements")
    @XmlElement(name = "measurement")
    public List<TimingMeasurement> getMeasurements() {
        return Collections.unmodifiableList(measurements);
    }
}
