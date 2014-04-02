/*******************************************************************************************************************************
 * It's Browser Time!
 * 
 * 
 * Copyright (C) 2013 by Tobias Lidskog (https://twitter.com/tobiaslidskog) & Peter Hedenskog
 * (http://peterhedenskog.com)
 * 
 ******************************************************************************************************************************** 
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 * 
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 * 
 ******************************************************************************************************************************** 
 */
package net.browsertime.tool.timingrunner;

import java.net.URL;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import net.browsertime.tool.BrowserTimeException;
import net.browsertime.tool.datacollector.TimingDataCollector;
import net.browsertime.tool.logger.Logger;
import net.browsertime.tool.timings.TimingRun;
import net.browsertime.tool.timings.TimingSession;
import net.browsertime.tool.webdriver.WebDriverProvider;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.WebDriverWait;

import com.google.inject.Inject;
import com.google.inject.name.Named;

/**
 *
 */
public class SeleniumTimingRunner implements TimingRunner {
  private final WebDriverProvider driverProvider;
  private final Set<TimingDataCollector> dataCollectors;
  private final int timeoutSeconds;
  private final Logger logger;

  @Inject
  public SeleniumTimingRunner(Set<TimingDataCollector> dataCollectors,
                              WebDriverProvider driverProvider,
                              @Named("timeoutSeconds") int timeoutSeconds, Logger logger) {
    this.dataCollectors = dataCollectors;
    this.driverProvider = driverProvider;
    this.timeoutSeconds = timeoutSeconds;
    this.logger = logger;
  }

  @Override
  public TimingSession run(URL url, int numIterations)
      throws BrowserTimeException {
    try {
      logger.printDebug("Validating driver provider.");
      driverProvider.validateProvider();

      TimingSession session = new TimingSession();
      for (int i = 1; i <= numIterations; i++) {
        WebDriver driver = driverProvider.get();
        try {
          JavascriptExecutor js = fetchUrl(driver, url, timeoutSeconds);

          logger.printStatus("Collecting timing data for " + url + " (run " + i + " of " + numIterations + ")");
          session.addTimingRun(collectTimingData(js));

          if (i == numIterations) {
            logger.printStatus("Collecting page data for " + url);
            session.addPageData(collectPageData(url, js));
          }
        } finally {
          driver.quit();
        }
      }
      return session;
    } catch (TimeoutException e) {
      throw new TimingRunnerException("Timeout, page was still loading after " + timeoutSeconds
          + " seconds.", e);
    } catch (WebDriverException e) {
      throw new BrowserTimeException("Error while running Selenium.", e);
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

    for (TimingDataCollector collector : dataCollectors) {
      collector.collectTimingData(js, results);
    }

    return results;
  }

  private JavascriptExecutor fetchUrl(WebDriver driver, URL url, int timeoutSeconds) {
    String urlString = url.toString();
    driver.get(urlString);
    waitForLoad(driver, timeoutSeconds);
    return (JavascriptExecutor) driver;
  }

  private void waitForLoad(WebDriver driver, int timeoutSeconds) {
    ExpectedCondition<Boolean> pageLoadCondition = new ExpectedCondition<Boolean>() {
      public Boolean apply(WebDriver driver) {
        return ((JavascriptExecutor) driver).executeScript("return document.readyState").equals(
            "complete");
      }
    };
    WebDriverWait wait = new WebDriverWait(driver, timeoutSeconds);
    wait.until(pageLoadCondition);
  }

}
