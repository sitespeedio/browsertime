package com.soulgalore.web.performance.navigation.datacollector;

import com.soulgalore.web.performance.navigation.timings.TimingRun;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.HasCapabilities;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;

import java.util.Map;

/**
 * Custom data defined by browser time.
 */
public class BrowserTimeDataCollector extends TimingDataCollector {

    private static final MarkInterval[] intervals = {
            new MarkInterval("domainLookup", "domainLookupStart", "domainLookupEnd"),
            new MarkInterval("redirectTime", "redirectStart", "redirectEnd"),
            new MarkInterval("initialConnection", "connectStart", "connectEnd"),
            new MarkInterval("ttfb", "connectEnd", "responseStart"),
            new MarkInterval("basePage", "responseStart", "responseEnd"),
            new MarkInterval("domProcessing", "domLoading", "domInteractive"),
            new MarkInterval("renderTime", "domContentLoadedEventStart", "loadEventEnd"),
            new MarkInterval("domInteractive", "navigationStart", "domInteractive"),
            new MarkInterval("domComplete", "navigationStart", "domComplete"),
            new MarkInterval("pageLoad", "navigationStart", "loadEventStart"),
            new MarkInterval("frontEnd", "responseEnd", "loadEventStart"),
            new MarkInterval("backEnd", "navigationStart", "responseStart"),
    };

    @Override
    public void collectPageData(JavascriptExecutor js, Map<String, String> pageInfo) {
        // This won't give proper url in case in connections error
        if (js instanceof WebDriver) {
            pageInfo.put("actualUrl", ((WebDriver)js).getCurrentUrl());
        }

        if (js instanceof HasCapabilities) {
            Capabilities caps = ((HasCapabilities) js).getCapabilities();
            pageInfo.put("browserName", caps.getBrowserName());
            pageInfo.put("browserVersion", caps.getVersion());
            pageInfo.put("platform", caps.getPlatform().name());
            // caps.asMap()
        }
    }

    @Override
    public void collectMeasurements(JavascriptExecutor js, TimingRun results) {
        for (MarkInterval interval : intervals) {
            interval.collectMeasurement(results);
        }
    }

}
