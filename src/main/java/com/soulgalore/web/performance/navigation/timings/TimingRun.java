package com.soulgalore.web.performance.navigation.timings;

import javax.xml.bind.annotation.XmlElementWrapper;
import java.util.*;

public class TimingRun {
    private Map<String, TimingMark> marks = new HashMap<String, TimingMark>();
    private List<TimingMeasurement> measurements = new ArrayList<TimingMeasurement>();

    public void addMark(TimingMark mark) {
        marks.put(mark.getName(), mark);
    }

    public TimingMark getMark(String name) {
        return marks.get(name);
    }

    @XmlElementWrapper
    public Collection<TimingMark> getMarks() {
        return Collections.unmodifiableCollection(marks.values());
    }

    public void addMeasurement(TimingMeasurement measurement) {
        measurements.add(measurement);
    }

    @XmlElementWrapper
    public List<TimingMeasurement> getMeasurements() {
        return Collections.unmodifiableList(measurements);
    }
}
