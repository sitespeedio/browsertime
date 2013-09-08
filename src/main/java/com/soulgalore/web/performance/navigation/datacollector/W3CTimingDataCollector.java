package com.soulgalore.web.performance.navigation.datacollector;

import com.soulgalore.web.performance.navigation.timings.TimingRun;
import com.soulgalore.web.performance.navigation.timings.TimingMark;
import org.openqa.selenium.JavascriptExecutor;

import java.util.List;
import java.util.Map;

import static com.soulgalore.web.performance.navigation.datacollector.Javascripts.LIST_STANDARD_MARKS;
import static com.soulgalore.web.performance.navigation.datacollector.Javascripts.STANDARD_MARK_PREFIX;

/**
 * Marks and measurements defined in the w3c timing recommendation.
 */
public class W3CTimingDataCollector extends TimingDataCollector {
    @Override
    public void collectPageData(JavascriptExecutor js, Map<String, String> pageInfo) {
        long redirectCount = (Long) js.executeScript("return window.performance.navigation.redirectCount;");
        pageInfo.put("redirectCount", Long.toString(redirectCount));
    }

    @Override
    @SuppressWarnings("unchecked")
    public void collectMarks(JavascriptExecutor js, TimingRun results) {
        if (!isNavigationTimingSupported(js)) {
            return;
        }

        List<String> markNames = (List) js.executeScript(LIST_STANDARD_MARKS);

        for (String markName : markNames) {
            long startTime = (Long) js.executeScript("return " + STANDARD_MARK_PREFIX + markName);
            // possibly filter out 0 times
            results.addMark(new TimingMark(markName, startTime));
        }
    }

    private boolean isNavigationTimingSupported(JavascriptExecutor js) {
        return (Boolean) js
                .executeScript("return !!(window.performance && window.performance.timing);");
    }
}
