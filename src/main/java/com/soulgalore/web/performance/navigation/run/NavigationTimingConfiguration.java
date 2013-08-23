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
package com.soulgalore.web.performance.navigation.run;

import java.util.Arrays;
import java.util.Collection;

public class NavigationTimingConfiguration {

	public static final String CHROME = "chrome";
	public static final String FIREFOX = "firefox";
	public static final String INTERNET_EXPLORER = "ie";
	
	public static final Collection<String> VALID_BROWSERS = Arrays.asList(
			CHROME, FIREFOX, INTERNET_EXPLORER);

	public static final String OUTPUT_XML = "xml";
	public static final String OUTPUT_JSON = "json";
	
	public static final Collection<String> VALID_OUTPUT_FORMATS = Arrays.asList(
			OUTPUT_JSON,OUTPUT_XML);
	
	private String url;
	private int runs;
	private String browser;
	private String filename;
	private boolean includeIndividualRuns;
	private String format;

	private NavigationTimingConfiguration() {
	}

	public String getURL() {
		return url;
	}

	public int getRuns() {
		return runs;
	}

	public String getBrowser() {
		return browser;
	}

	public String getFilename() {
		return filename;
	}

	public boolean includeIndividualRuns() {
		return includeIndividualRuns;
	}

	public String getOutputFormat() {
		return format;
	}
	
	private void setURL(String url) {
		this.url = url;
	}

	private void setRuns(int runs) {
		this.runs = runs;
	}

	private void setBrowser(String browser) {
		this.browser = browser;
	}

	private void setFilename(String filename) {
		this.filename = filename;
	}

	private void setIncludeIndividualRuns(boolean includeIndividualRuns) {
		this.includeIndividualRuns = includeIndividualRuns;
	}
	
	private void setOutputFormat(String format) {
		this.format = format;
	}

	private NavigationTimingConfiguration copy() {
		final NavigationTimingConfiguration conf = new NavigationTimingConfiguration();
		conf.setBrowser(getBrowser());
		conf.setFilename(getFilename());
		conf.setIncludeIndividualRuns(includeIndividualRuns());
		conf.setRuns(getRuns());
		conf.setURL(getURL());
		conf.setOutputFormat(getOutputFormat());
		return conf;

	}

	public static class Builder {
		private final NavigationTimingConfiguration configuration = new NavigationTimingConfiguration();

		public Builder() {
		}

		public NavigationTimingConfiguration build() {
			return configuration.copy();
		}

		public Builder setURL(String url) {
			configuration.setURL(url);
			return this;
		}

		public Builder setRuns(int runs) {
			configuration.setRuns(runs);
			return this;
		}

		public Builder setBrowser(String browser) {
			configuration.setBrowser(browser);
			return this;
		}

		public Builder setFilename(String filename) {
			configuration.setFilename(filename);
			return this;
		}

		public Builder setIncludeIndividualRuns(boolean includeIndividualRuns) {
			configuration.setIncludeIndividualRuns(includeIndividualRuns);
			return this;
		}
		
		public Builder setOutputFormat(String format) {
			configuration.setOutputFormat(format);
			return this;
		}

	}

	public static Builder builder() {
		return new Builder();
	}
}
