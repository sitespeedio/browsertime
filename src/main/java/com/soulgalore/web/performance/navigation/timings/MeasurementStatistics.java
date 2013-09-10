package com.soulgalore.web.performance.navigation.timings;

import org.apache.commons.math3.stat.descriptive.DescriptiveStatistics;

import javax.xml.bind.annotation.XmlElement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

    @XmlElement(name = "statistic")
    public List<Statistic> getStatistics() {
        List<Statistic> result = new ArrayList<Statistic>(statistics.size());

        for (Map.Entry<String, DescriptiveStatistics> entry : statistics.entrySet()) {
            result.add(Statistic.create(entry.getKey(), entry.getValue()));
        }
        
        return result;
    }

    public static class Statistic {
        @XmlElement
        String name;
        @XmlElement
        double min;
        @XmlElement
        double avg;
        @XmlElement
        double median;
        @XmlElement
        double p60;
        @XmlElement
        double p70;
        @XmlElement
        double p80;
        @XmlElement
        double p90;
        @XmlElement
        double max;

        public static Statistic create(String name, DescriptiveStatistics statistics) {
            Statistic statistic = new Statistic();
            statistic.name = name;
            statistic.min = statistics.getMin();
            statistic.avg = statistics.getMean();
            statistic.median = statistics.getPercentile(50);
            statistic.p60 = statistics.getPercentile(60);
            statistic.p70 = statistics.getPercentile(70);
            statistic.p80 = statistics.getPercentile(80);
            statistic.p90 = statistics.getPercentile(90);
            statistic.max = statistics.getMax();

            return statistic;
        }
    }

}
