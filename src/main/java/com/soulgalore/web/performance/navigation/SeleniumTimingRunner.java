package com.soulgalore.web.performance.navigation;

import com.google.inject.Inject;
import com.soulgalore.web.performance.navigation.datacollector.BrowserTimeDataCollector;
import com.soulgalore.web.performance.navigation.datacollector.TimingDataCollector;
import com.soulgalore.web.performance.navigation.datacollector.UserTimingDataCollector;
import com.soulgalore.web.performance.navigation.datacollector.W3CTimingDataCollector;
import com.soulgalore.web.performance.navigation.timings.TimingRun;
import com.soulgalore.web.performance.navigation.timings.TimingSession;
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
    public TimingSession run(URL url, int numIterations) {
        try {
            TimingSession session = new TimingSession();
            session.addPageData(collectPageData(url));
            for (int i = 0; i < numIterations; i++) {
                session.addTimingRun(collectTimingData(url));
            }
            return session;
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

    private TimingRun collectTimingData(URL url) {
        JavascriptExecutor js = fetchUrl(url);

        TimingRun results = new TimingRun();

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
