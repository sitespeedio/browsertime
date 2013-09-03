package com.soulgalore.web.performance.navigation.timings;

/**
 *
 */
public class TimingMeasurement extends TimingMark {
    private final long duration;

    public TimingMeasurement(String name, long startTime, long duration) {
        super(name, startTime);
        this.duration = duration;
    }

    long getDuration() {
        return duration;
    }
}
