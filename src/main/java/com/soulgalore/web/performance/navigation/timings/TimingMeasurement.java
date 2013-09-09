package com.soulgalore.web.performance.navigation.timings;

import javax.xml.bind.annotation.XmlAttribute;

/**
 *
 */
public class TimingMeasurement extends TimingMark {
    private final long duration;

    public TimingMeasurement(String name, long startTime, long duration) {
        super(name, startTime);
        this.duration = duration;
    }

    @XmlAttribute
    public long getDuration() {
        return duration;
    }
}
