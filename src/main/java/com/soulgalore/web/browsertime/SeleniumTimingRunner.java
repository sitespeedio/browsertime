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
package com.soulgalore.web.browsertime;

 import com.google.inject.Inject;
 import com.google.inject.Provider;
 import com.soulgalore.web.browsertime.datacollector.BrowserTimeDataCollector;
 import com.soulgalore.web.browsertime.datacollector.TimingDataCollector;
 import com.soulgalore.web.browsertime.datacollector.UserTimingDataCollector;
 import com.soulgalore.web.browsertime.datacollector.W3CTimingDataCollector;
 import com.soulgalore.web.browsertime.timings.TimingRun;
 import com.soulgalore.web.browsertime.timings.TimingSession;
 import org.openqa.selenium.JavascriptExecutor;
 import org.openqa.selenium.WebDriver;
 import org.openqa.selenium.support.ui.ExpectedCondition;
 import org.openqa.selenium.support.ui.WebDriverWait;

 import java.net.URL;
 import java.util.Arrays;
 import java.util.HashMap;
 import java.util.List;
 import java.util.Map;

/**
 *
 */
public class SeleniumTimingRunner implements TimingRunner {
    public static final int MAX_WAIT_SECONDS = 60;

    private final Provider<WebDriver> driverProvider;
    private final List<TimingDataCollector> dataCollectors;

    @Inject
    public SeleniumTimingRunner(TimingDataCollector browserDataCollector, Provider<WebDriver> driverProvider) {
        this.driverProvider = driverProvider;
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
        }
    }

    private Map<String, String> collectPageData(URL url) {
        WebDriver driver = driverProvider.get();
        try {
            JavascriptExecutor js = fetchUrl(driver, url);

            Map<String, String> pageInfo = new HashMap<String, String>();
            pageInfo.put("url", url.toString());

            for (TimingDataCollector collector : dataCollectors) {
                collector.collectPageData(js, pageInfo);
            }

            // possibly collect user specified page info (e.g. "page version" js property)

            return pageInfo;
        } finally {
            driver.quit();
        }
    }

    private TimingRun collectTimingData(URL url) {
        WebDriver driver = driverProvider.get();
        try {
            JavascriptExecutor js = fetchUrl(driver, url);

            TimingRun results = new TimingRun();

            for (TimingDataCollector collector : dataCollectors) {
                collector.collectMarks(js, results);
            }

            for (TimingDataCollector collector : dataCollectors) {
                collector.collectMeasurements(js, results);
            }

            return results;
        } finally {
            driver.quit();
        }
    }

    private JavascriptExecutor fetchUrl(WebDriver driver, URL url) {
        String urlString = url.toString();
        driver.get(urlString);
        waitForLoad(driver);
        return (JavascriptExecutor) driver;
    }

    private void waitForLoad(WebDriver driver) {
        ExpectedCondition<Boolean> pageLoadCondition = new
                ExpectedCondition<Boolean>() {
                    public Boolean apply(WebDriver driver) {
                        return ((JavascriptExecutor)driver).executeScript("return document.readyState").equals("complete");
                    }
                };
        WebDriverWait wait = new WebDriverWait(driver, MAX_WAIT_SECONDS);
        wait.until(pageLoadCondition);
    }

}
