package com.soulgalore.web.performance.navigation.datacollector;

import com.soulgalore.web.performance.navigation.timings.Timing;
import com.soulgalore.web.performance.navigation.timings.TimingMark;
import org.openqa.selenium.JavascriptExecutor;

/**
 *
 */
public class InternetExplorerDataCollector extends TimingDataCollector {
    @Override
    public void collectMarks(JavascriptExecutor js, Timing results) {
        super.collectMarks(js, results);

        Long time = (Long) js.executeScript("return window.performance.timing.msFirstPaint");
        results.addMark(new TimingMark("msFirstPaint", time));
    }
}
