package com.soulgalore.web.performance.navigation;

import com.google.inject.Inject;
import com.soulgalore.web.performance.navigation.datacollector.TimingDataCollector;
import com.soulgalore.web.performance.navigation.timings.Timing;
import com.soulgalore.web.performance.navigation.timings.TimingMark;
import com.soulgalore.web.performance.navigation.timings.TimingMeasurement;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.HasCapabilities;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;

import java.net.URL;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.soulgalore.web.performance.navigation.Javascripts.*;

/**
 *
 */
public class SeleniumTimingRunner implements TimingRunner {
    private final WebDriver driver;
    private final TimingDataCollector browserDataCollector;
    private final TimingDataCollector w3cDataCollector;
    private final TimingDataCollector userTimingDataCollector;

    @Inject
    public SeleniumTimingRunner(WebDriver driver, TimingDataCollector browserDataCollector) {
        this.driver = driver;
        this.browserDataCollector = browserDataCollector;
        this.w3cDataCollector = new W3CTimingDataCollector();
        this.userTimingDataCollector = new UserTimingDataCollector();
    }

    @Override
    public List<Timing> run(URL url, int numIterations) {
        try {
            Map<String, String> pageData = collectPageData(url);
            List<Timing> timings = new ArrayList<Timing>(numIterations);
            for (int i = 1; i <= numIterations; i++) {
                timings.add(collectTimingData(url));
            }
            return timings;
        } catch (Exception e) {
            throw new RuntimeException(e);
        } finally {
            driver.quit();
        }
    }

    private Map<String, String> collectPageData(URL url) {
        JavascriptExecutor js = fetchUrl(url);

        Map<String, String> pageInfo = new HashMap<String, String>();
        pageInfo.put("url", url.toString());

        collectStandardPageData(js, pageInfo);
        
        // collect browser specific static data
        browserDataCollector.collectPageData(js, pageInfo);

        // possibly collect user specified page info (e.g. "page version" js property)

        return pageInfo;
    }

    private void collectStandardPageData(JavascriptExecutor js, Map<String, String> pageInfo) {
        // This won't give proper url in case in connections error
        pageInfo.put("actualUrl", driver.getCurrentUrl());

        if (js instanceof HasCapabilities) {
            Capabilities caps = ((HasCapabilities) js).getCapabilities();
            pageInfo.put("browserName", caps.getBrowserName());
            pageInfo.put("browserVersion", caps.getVersion());
            pageInfo.put("platform", caps.getPlatform().name());
            // caps.asMap()
        }

        long redirectCount = (Long) js.executeScript("return window.performance.navigation.redirectCount;");
        pageInfo.put("redirectCount", Long.toString(redirectCount));
    }

    private Timing collectTimingData(URL url) {
        JavascriptExecutor js = fetchUrl(url);

        Timing results = new Timing();

        if (isNavigationTimingSupported(js)) {
            w3cDataCollector.collectMarks(js, results);
            browserDataCollector.collectMarks(js, results);

            w3cDataCollector.collectMeasurements(js, results);
            browserDataCollector.collectMeasurements(js, results);
        }

        if (isPageDefinedTimingsSupported(js)) {
            userTimingDataCollector.collectMarks(js, results);
            userTimingDataCollector.collectMeasurements(js, results);
        }

        return results;
    }

    private JavascriptExecutor fetchUrl(URL url) {
        String urlString = url.toString();
        driver.get(urlString);
        return (JavascriptExecutor)driver;
    }

    private boolean isNavigationTimingSupported(JavascriptExecutor js) {
        return (Boolean) js
                    .executeScript("return !!(window.performance && window.performance.timing);");
    }

    private boolean isPageDefinedTimingsSupported(JavascriptExecutor js) {
        return (Boolean) js
                .executeScript("return !!(window.performance && window.performance.getEntriesByType);");
    }

    /**
     * Marks and measurements defined in the w3c timing recommendation.
     */
    private class W3CTimingDataCollector extends TimingDataCollector {
        @Override
        @SuppressWarnings("unchecked")
        public void collectMarks(JavascriptExecutor js, Timing results) {
            List<String> markNames = (List) js.executeScript(LIST_STANDARD_MARKS);

            for (String markName : markNames) {
                long startTime = (Long) js.executeScript("return " + STANDARD_MARK_PREFIX + markName);
                // possibly filter out 0 times
                results.addMark(new TimingMark(markName, startTime));
            }
        }
    }

    /**
     * Marks and measurements defined in the w3c user timing recommendation.
     */
    private class UserTimingDataCollector extends TimingDataCollector {
        @Override
        @SuppressWarnings("unchecked")
        public void collectMarks(JavascriptExecutor js, Timing results) {
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

    }
}
