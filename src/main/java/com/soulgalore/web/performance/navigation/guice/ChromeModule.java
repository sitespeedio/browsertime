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

package com.soulgalore.web.performance.navigation.guice;


import com.google.inject.AbstractModule;
import com.soulgalore.web.performance.navigation.*;
import com.soulgalore.web.performance.navigation.datacollector.ChromeDataCollector;
import com.soulgalore.web.performance.navigation.datacollector.TimingDataCollector;
import com.soulgalore.web.performance.navigation.metrics.ChromeMetrics;
import com.soulgalore.web.performance.navigation.metrics.Metrics;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;

/**
 * Setup a module that uses Chrome.
 *
 */
public class ChromeModule extends AbstractModule {

	/**
	 * Bind the classes.
	 */
	@Override
	protected void configure() {
		bind(WebDriver.class).to(ChromeDriver.class);
        bind(Metrics.class).to(ChromeMetrics.class);
        bind(TimingRunner.class).to(SeleniumTimingRunner.class);
        bind(TimingDataCollector.class).to(ChromeDataCollector.class);
    }
}
