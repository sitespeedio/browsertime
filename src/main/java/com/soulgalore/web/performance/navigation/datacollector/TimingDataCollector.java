package com.soulgalore.web.performance.navigation.datacollector;

import com.soulgalore.web.performance.navigation.timings.Timing;
import org.openqa.selenium.JavascriptExecutor;

import java.util.Map;

/**
 * Superclass for browser specific data collection, subclass as needed.
 */
public class TimingDataCollector {

    public void collectPageData(JavascriptExecutor js, Map<String, String> pageInfo) {
    }

    public void collectMarks(JavascriptExecutor js, Timing results) {
    }

    public void collectMeasurements(JavascriptExecutor js, Timing results) {
    }

}
