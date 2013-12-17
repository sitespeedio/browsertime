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
package net.browsertime.tool.timingrunner;

 import com.google.inject.Inject;
 import com.google.inject.Provider;
 import com.google.inject.name.Named;
 import net.browsertime.tool.datacollector.BrowserTimeDataCollector;
 import net.browsertime.tool.datacollector.TimingDataCollector;
 import net.browsertime.tool.datacollector.UserTimingDataCollector;
 import net.browsertime.tool.datacollector.W3CTimingDataCollector;
 import net.browsertime.tool.timings.TimingRun;
 import net.browsertime.tool.timings.TimingSession;
 import org.openqa.selenium.JavascriptExecutor;
 import org.openqa.selenium.TimeoutException;
 import org.openqa.selenium.WebDriver;
 import org.openqa.selenium.WebDriverException;
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
    private final Provider<WebDriver> driverProvider;
    private final List<TimingDataCollector> dataCollectors;
    private final boolean verbose;

    @Inject
    public SeleniumTimingRunner(TimingDataCollector browserDataCollector, Provider<WebDriver> driverProvider,
                                @Named("verbose") boolean verbose) {
        TimingDataCollector w3cDataCollector = new W3CTimingDataCollector();
        TimingDataCollector userTimingDataCollector = new UserTimingDataCollector(true);
        TimingDataCollector browserTimeDataCollector = new BrowserTimeDataCollector();

        this.dataCollectors = Arrays.asList(w3cDataCollector, browserDataCollector,
                userTimingDataCollector, browserTimeDataCollector);
        this.driverProvider = driverProvider;
        this.verbose = verbose;
    }

    @Override
    public TimingSession run(URL url, int numIterations, int timeoutSeconds) throws TimingRunnerException {
        try {
            TimingSession session = new TimingSession();
            boolean hasCollectedPageData = false;
            for (int i = 0; i < numIterations; i++) {
                WebDriver driver = driverProvider.get();
                try {
                    JavascriptExecutor js = fetchUrl(driver, url, timeoutSeconds);

                    session.addTimingRun(collectTimingData(js));

                    if (!hasCollectedPageData) {
                        session.addPageData(collectPageData(url, js));
                        hasCollectedPageData = true;
                    }
                } finally {
                    driver.quit();
                }
            }
            return session;
        } catch (TimeoutException e) {
            throw new TimingRunnerException("Timeout, page was still loading after " + timeoutSeconds + " seconds.", e);
        } catch (WebDriverException e) {
            throw new TimingRunnerException("Error while running Selenium.", e);
        }
    }

    private Map<String, String> collectPageData(URL url, JavascriptExecutor js) {
        Map<String, String> pageInfo = new HashMap<String, String>();
        pageInfo.put("url", url.toString());

        for (TimingDataCollector collector : dataCollectors) {
            collector.collectPageData(js, pageInfo);
        }

        // possibly collect user specified page info (e.g. "page version" js property)

        return pageInfo;
    }

    private TimingRun collectTimingData(JavascriptExecutor js) {
        TimingRun results = new TimingRun();

        printStatus("Collecting timing marks");
        for (TimingDataCollector collector : dataCollectors) {
            collector.collectMarks(js, results);
        }

        printStatus("Collecting timing measurements");
        for (TimingDataCollector collector : dataCollectors) {
            collector.collectMeasurements(js, results);
        }

        return results;
    }

    private JavascriptExecutor fetchUrl(WebDriver driver, URL url, int timeoutSeconds) {
        String urlString = url.toString();
        printStatus("Fetching url: " + urlString);
        driver.get(urlString);
        waitForLoad(driver, timeoutSeconds);
        return (JavascriptExecutor) driver;
    }

    private void printStatus(String s) {
        if (verbose) {
            System.err.println(s);
        }
    }

    private void waitForLoad(WebDriver driver, int timeoutSeconds) {
        ExpectedCondition<Boolean> pageLoadCondition = new
                ExpectedCondition<Boolean>() {
                    public Boolean apply(WebDriver driver) {
                        return ((JavascriptExecutor)driver).executeScript("return document.readyState").equals("complete");
                    }
                };
        WebDriverWait wait = new WebDriverWait(driver, timeoutSeconds);
        wait.until(pageLoadCondition);
    }

}
