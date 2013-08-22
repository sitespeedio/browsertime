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

/**
 * Holds extra information about the test.
 * 
 */
public class TestMetaData {

	
	private final String url;
	private final String browser;
	private final String browserVersion;
	private final Date when;
	private final String name;

	public TestMetaData(String url, String browser, String browserVersion,
			Date when, String name) {
		this.url = url;
		this.browser = browser;
		this.browserVersion = browserVersion;
		this.when = when;
		this.name = name;
	}

	public String getURL() {
		return url;
	}

	public String getName() {
		return name;
	}
	
	public String getBrowser() {
		return browser;
	}

	public String getBrowserVersion() {
		return browserVersion;
	}

	public Date getWhen() {
		return when;
	}

}
