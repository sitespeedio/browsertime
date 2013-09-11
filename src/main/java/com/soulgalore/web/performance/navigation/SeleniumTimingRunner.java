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
