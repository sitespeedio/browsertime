package com.soulgalore.web.performance.navigation.datacollector;

import com.soulgalore.web.performance.navigation.timings.Timing;
import com.soulgalore.web.performance.navigation.timings.TimingMark;
import com.soulgalore.web.performance.navigation.timings.TimingMeasurement;
import org.openqa.selenium.JavascriptExecutor;

import java.util.List;
import java.util.Map;

import static com.soulgalore.web.performance.navigation.datacollector.Javascripts.LIST_PAGE_DEFINED_MARKS;
import static com.soulgalore.web.performance.navigation.datacollector.Javascripts.LIST_PAGE_DEFINED_MEASUREMENTS;

/**
 * Marks and measurements defined in the w3c user timing recommendation.
 */
public class UserTimingDataCollector extends TimingDataCollector {
    @Override
    @SuppressWarnings("unchecked")
    public void collectMarks(JavascriptExecutor js, Timing results) {
        if (!isPageDefinedTimingsSupported(js)) {
            return;
        }

        List marks = (List) js.executeScript(LIST_PAGE_DEFINED_MARKS);

        for (Object m : marks) {
            Map mark = (Map) m;
            String name = (String) mark.get("name");
            double doubleTime = (Double) mark.get("startTime");
            long startTime = Double.valueOf(doubleTime).longValue();
            // possibly filter out 0 times
            results.addMark(new TimingMark(name, startTime));
        }
    }

    @Override
    public void collectMeasurements(JavascriptExecutor js, Timing results) {
        if (!isPageDefinedTimingsSupported(js)) {
            return;
        }

        List measurements = (List) js.executeScript(LIST_PAGE_DEFINED_MEASUREMENTS);

        for (Object m : measurements) {
            Map mark = (Map) m;
            String name = (String) mark.get("name");
            double doubleTime = (Double) mark.get("startTime");
            long startTime = Double.valueOf(doubleTime).longValue();
            doubleTime = (Double) mark.get("duration");
            long duration = Double.valueOf(doubleTime).longValue();
            // possibly filter out 0 times
            results.addMeasurement(new TimingMeasurement(name, startTime, duration));
        }
    }

    private boolean isPageDefinedTimingsSupported(JavascriptExecutor js) {
        return (Boolean) js
                .executeScript("return !!(window.performance && window.performance.getEntriesByType);");
    }
}
