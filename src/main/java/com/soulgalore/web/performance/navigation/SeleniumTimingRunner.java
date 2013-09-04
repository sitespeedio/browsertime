package com.soulgalore.web.performance.navigation;

import com.google.inject.Inject;
import com.soulgalore.web.performance.navigation.datacollector.BrowserTimeDataCollector;
import com.soulgalore.web.performance.navigation.datacollector.TimingDataCollector;
import com.soulgalore.web.performance.navigation.datacollector.UserTimingDataCollector;
import com.soulgalore.web.performance.navigation.datacollector.W3CTimingDataCollector;
import com.soulgalore.web.performance.navigation.timings.Timing;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;

import java.net.URL;
import java.util.*;

/**
 *
 */
public class SeleniumTimingRunner implements TimingRunner {
    private final WebDriver driver;

    private final List<TimingDataCollector> dataCollectors;

    @Inject
    public SeleniumTimingRunner(WebDriver driver, TimingDataCollector browserDataCollector) {
        this.driver = driver;
        TimingDataCollector w3cDataCollector = new W3CTimingDataCollector();
        TimingDataCollector userTimingDataCollector = new UserTimingDataCollector();
        TimingDataCollector browserTimeDataCollector = new BrowserTimeDataCollector();

        this.dataCollectors = Arrays.asList(w3cDataCollector, browserDataCollector,
                userTimingDataCollector, browserTimeDataCollector);
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

        for (TimingDataCollector collector : dataCollectors) {
            collector.collectPageData(js, pageInfo);
        }

        // possibly collect user specified page info (e.g. "page version" js property)

        return pageInfo;
    }

    private Timing collectTimingData(URL url) {
        JavascriptExecutor js = fetchUrl(url);

        Timing results = new Timing();

        for (TimingDataCollector collector : dataCollectors) {
            collector.collectMarks(js, results);
        }

        for (TimingDataCollector collector : dataCollectors) {
            collector.collectMeasurements(js, results);
        }

        return results;
    }

    private JavascriptExecutor fetchUrl(URL url) {
        String urlString = url.toString();
        driver.get(urlString);
        return (JavascriptExecutor) driver;
    }
}
