package com.soulgalore.web.performance.navigation.metrics;

import java.util.ArrayList;
import java.util.List;

/**
 *
 */
public class ChromeMetrics extends StandardMetrics {
    @Override
    public List<NamedMetric> getAllMetrics() {
        List<NamedMetric> allMetrics = new ArrayList<NamedMetric>();
        allMetrics.addAll(super.getAllMetrics());

        allMetrics.add(new IntervalMetric("firstPaint", "navigationStart", "firstPaintTime"));

        return allMetrics;
    }
}
