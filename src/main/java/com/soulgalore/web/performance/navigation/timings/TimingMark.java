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

    String getName() {
        return name;
    }

    long getStartTime() {
        return startTime;
    }
}
