package com.soulgalore.web.performance.navigation.timings;

import javax.xml.bind.annotation.XmlAttribute;

/**
 *
 */
public class TimingMark {
    private final String name;
    private final long startTime;

    public TimingMark(String name, long startTime) {
        this.name = name;
        this.startTime = startTime;
    }

    @XmlAttribute
    public String getName() {
        return name;
    }

    @XmlAttribute
    public long getStartTime() {
        return startTime;
    }

    private TimingMark() {
        name = null;
        startTime = 0;
    }
}
