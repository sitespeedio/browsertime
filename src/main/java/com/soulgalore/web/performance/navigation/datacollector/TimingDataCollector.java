package com.soulgalore.web.performance.navigation.datacollector;

import com.soulgalore.web.performance.navigation.timings.TimingMark;
import com.soulgalore.web.performance.navigation.timings.TimingMeasurement;
import com.soulgalore.web.performance.navigation.timings.TimingRun;
import org.openqa.selenium.JavascriptExecutor;

import java.util.Map;

/**
 * Superclass for browser specific data collection, subclass as needed.
 */
public class TimingDataCollector {

    public void collectPageData(JavascriptExecutor js, Map<String, String> pageInfo) {
    }

    public void collectMarks(JavascriptExecutor js, TimingRun results) {
    }

    public void collectMeasurements(JavascriptExecutor js, TimingRun results) {
    }

    final static class MarkInterval {
        private final String measurementName;
        private final String startMarkName;
        private final String endMarkName;

        MarkInterval(String measurementName, String startMarkName, String endMarkName) {
            this.measurementName = measurementName;
            this.startMarkName = startMarkName;
            this.endMarkName = endMarkName;
        }

        void collectMeasurement(TimingRun timingRun) {
            TimingMark start = timingRun.getMark(startMarkName);
            TimingMark end = timingRun.getMark(endMarkName);

            if (start != null && end != null) {
                long duration = end.getStartTime() - start.getStartTime();
                TimingMeasurement m = new TimingMeasurement(measurementName, start.getStartTime(), duration);
                timingRun.addMeasurement(m);
            }
        }
    }
}
