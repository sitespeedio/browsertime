/******************************************************
 * Navigation timing
 * 
 *
 * Copyright (C) 2013 by Peter Hedenskog (http://peterhedenskog.com)
 *
 ******************************************************
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
 *******************************************************
 */
package com.soulgalore.web.performance.navigation;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.RemoteWebDriver;

import com.google.inject.Inject;

/**
 * Selenium backend for getting the Navigation Timing data.
 * 
 */
public class NavigationTimingSeleniumCreator implements NavigationTimingCreator {

	private final WebDriver driver;

	private static final String TIMING = "performance.timing.";

	private static final String SELENIUM = "return window.";

	@Inject
	public NavigationTimingSeleniumCreator(WebDriver driver) {
		this.driver = driver;
	}

	public NavigationTiming get(String url, String name) {
		try {
			driver.get(url);

			// hack to get browser & version
			Capabilities caps = ((RemoteWebDriver) driver).getCapabilities();
			String browserName = caps.getBrowserName();
			String browserVersion = caps.getVersion();

			JavascriptExecutor js = (JavascriptExecutor) driver;

			verifyNavigationTimingSupport(js, browserName, browserVersion);

			Map<String, Long> timings = new HashMap<String, Long>();

			// Object.getOwnPropertyNames(window.performance.timing)
			for (String timing : NavigationTimingData.DEFAULT_NAV_TIMINGS) {
				timings.put(timing,
						(Long) js.executeScript(SELENIUM + TIMING + timing));
			}

			// TODO check this test
			if (browserName.toLowerCase().contains("explorer")) {
				// in milliseconds
				timings.put(
						"msFirstPaint",
						(Long) js.executeScript(SELENIUM + TIMING
								+ "msFirstPaint"));
			}

			
			else if (browserName.toLowerCase().contains("chrome")) {
				// TODO cleanup names
				timings.put(
						"wasFetchedViaSpdy",
						(Boolean) js
								.executeScript("return window.chrome.loadTimes().wasFetchedViaSpdy") ? new Long(
								1) : new Long(0));
	
		
				// Chrome timing is in s.ms, convert it to ms!!
				Double time = (Double) js.executeScript("return window.chrome.loadTimes().firstPaintTime");
				timings.put("firstPaintTime", ((long)(time*1000)));
			}

			return new NavigationTiming(new TestMetaData(url, browserName,
					browserVersion, new Date(), name),
					new NavigationTimingData(timings));
		} finally {
			if (driver != null) {
				driver.quit();

			}
		}
	}

	private void verifyNavigationTimingSupport(JavascriptExecutor js,
	                                           String browserName, String browserVersion) {
		Boolean isNavigationTimingSupported = (Boolean) js
				.executeScript("return !!(window.performance && window.performance.timing);");
		if (!isNavigationTimingSupported)
			throw new RuntimeException(browserName + " " + browserVersion
					+ " doesn't support the navigation timing API!");
	}

}
