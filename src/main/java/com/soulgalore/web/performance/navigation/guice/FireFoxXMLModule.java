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

import org.openqa.selenium.WebDriver;

import com.google.inject.AbstractModule;
import com.soulgalore.web.performance.navigation.NavigationTimingCreator;
import com.soulgalore.web.performance.navigation.NavigationTimingSeleniumCreator;
import com.soulgalore.web.performance.navigation.result.NavigationTimingResult;
import com.soulgalore.web.performance.navigation.result.NavigationTimingXMLResult;

/**
 * Setup a module that uses Firefox and outputs XML.
 *
 */
public class FireFoxXMLModule extends AbstractModule {

	@Override
	protected void configure() {
		bind(WebDriver.class).toProvider(FireFoxProvider.class);
		bind(NavigationTimingResult.class).to(NavigationTimingXMLResult.class);
		bind(NavigationTimingCreator.class).to(NavigationTimingSeleniumCreator.class);
		
	}
}
