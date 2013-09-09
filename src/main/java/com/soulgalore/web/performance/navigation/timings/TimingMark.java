package com.soulgalore.web.performance.navigation.timings;

import javax.xml.bind.annotation.XmlAttribute;

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

    @XmlAttribute
    public String getName() {
        return name;
    }

    @XmlAttribute
    public long getStartTime() {
        return startTime;
    }
}
