package com.soulgalore.web.performance.navigation.datacollector;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.HasCapabilities;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;

import java.util.Map;

/**
 * Custom data defined by browser time.
 */
public class BrowserTimeDataCollector extends TimingDataCollector {

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
}
