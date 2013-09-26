 /*******************************************************************************************************************************
 * It's Browser Time!
 * 
 *
 * Copyright (C) 2013 by Tobias Lidskog (https://twitter.com/tobiaslidskog) &  Peter Hedenskog (http://peterhedenskog.com)
 *
 ********************************************************************************************************************************
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in 
 * compliance with the License. You may obtain a copy of the License at
 * 
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is 
 * distributed  on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.   
 * See the License for the specific language governing permissions and limitations under the License.
 *
 ********************************************************************************************************************************
 */
package com.soulgalore.web.browsertime.datacollector;

import com.soulgalore.web.browsertime.timings.TimingRun;

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
            new MarkInterval("domainLookupTime", "domainLookupStart", "domainLookupEnd"),
            new MarkInterval("redirectionTime", "navigationStart","fetchStart"),
            new MarkInterval("serverConnectionTime", "connectStart", "connectEnd"),
            new MarkInterval("serverResponseTime", "requestStart", "responseStart"),
            new MarkInterval("pageDownloadTime", "responseStart", "responseEnd"),
            new MarkInterval("domInteractiveTime", "navigationStart", "domInteractive"),
            new MarkInterval("domContentLoadedTime", "navigationStart", "domContentLoadedEventStart"),
            new MarkInterval("pageLoadTime", "navigationStart", "loadEventStart"),            
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
