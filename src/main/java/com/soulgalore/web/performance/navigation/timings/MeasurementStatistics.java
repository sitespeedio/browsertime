package com.soulgalore.web.performance.navigation.timings;

import org.apache.commons.math3.stat.descriptive.DescriptiveStatistics;

import java.util.HashMap;
import java.util.Map;

/**
 *
 */
public class MeasurementStatistics {
    private final Map<String, DescriptiveStatistics> statistics = new HashMap<String, DescriptiveStatistics>();

    public void addMeasurement(TimingMeasurement measurement) {
        DescriptiveStatistics stats = getStatistics(measurement.getName());
        stats.addValue(measurement.getDuration());
    }

    private DescriptiveStatistics getStatistics(String name) {
        DescriptiveStatistics stats = statistics.get(name);
        if (stats == null) {
            stats = new DescriptiveStatistics();
            statistics.put(name, stats);
        }
        return stats;
    }
}
