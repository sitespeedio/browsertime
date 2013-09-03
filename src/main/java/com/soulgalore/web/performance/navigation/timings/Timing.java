package com.soulgalore.web.performance.navigation.timings;

import java.util.ArrayList;
import java.util.List;

public class Timing {
    private List<TimingMark> marks = new ArrayList<TimingMark>();
    private List<TimingMeasurement> measurements = new ArrayList<TimingMeasurement>();

    public void addMark(TimingMark mark) {
        marks.add(mark);
    }

    public List<TimingMark> getMarks() {
        return marks;
    }

    public void addMeasurement(TimingMeasurement measurement) {
        measurements.add(measurement);
    }

    public List<TimingMeasurement> getMeasurements() {
        return measurements;
    }
}
