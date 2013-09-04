package com.soulgalore.web.performance.navigation.timings;

/**
 *
 */
public class TimingMark {
    private String name;
    private long startTime;

    public TimingMark(String name, long startTime) {
        this.name = name;
        this.startTime = startTime;
    }

    public String getName() {
        return name;
    }

    public long getStartTime() {
        return startTime;
    }
}
