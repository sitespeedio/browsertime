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

package com.soulgalore.web.browsertime.guice;

import java.util.HashMap;
import java.util.Map;

import com.google.inject.AbstractModule;
import com.google.inject.name.Names;
import com.soulgalore.web.browsertime.SeleniumTimingRunner;
import com.soulgalore.web.browsertime.TimingRunner;
import com.soulgalore.web.browsertime.datacollector.ChromeDataCollector;
import com.soulgalore.web.browsertime.datacollector.TimingDataCollector;
import com.soulgalore.web.browsertime.run.Main;

import org.openqa.selenium.WebDriver;


/**
 * Setup a module that uses Chrome.
 */
public class ChromeModule extends AbstractModule {

	public static final String USER_AGENT = "user-agent";
	public static final String WINDOW_SIZE = "window-size";
	
	private final Map<String,String> options = new HashMap<String,String>();
	
	public ChromeModule(String userAgent, String windowSize) {
			options.put(USER_AGENT, userAgent);
			options.put(WINDOW_SIZE, windowSize);
	}
	
	@Override
	protected void configure() {
		
		Names.bindProperties(binder(), options);
		
		bind(WebDriver.class)
        .toProvider(ChromeDriverProvider.class);
        bind(TimingRunner.class).to(SeleniumTimingRunner.class);
        bind(TimingDataCollector.class).to(ChromeDataCollector.class);
    }
}
