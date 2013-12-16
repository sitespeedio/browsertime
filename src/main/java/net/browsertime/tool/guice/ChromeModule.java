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

package net.browsertime.tool.guice;


import com.google.inject.Provider;
import net.browsertime.tool.BrowserConfig;
import net.browsertime.tool.datacollector.ChromeDataCollector;
import net.browsertime.tool.datacollector.TimingDataCollector;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;

import java.util.Map;

 /**
 * Setup a module that uses Chrome.
 */
public class ChromeModule extends AbstractBrowserModule {

     public ChromeModule(Map<BrowserConfig, String> browserConfiguration) {
         super(browserConfiguration);
     }

     @Override
	protected void configure() {
        super.configure();
        bind(WebDriver.class).toProvider(DRIVER_PROVIDER);
        bind(TimingDataCollector.class).to(ChromeDataCollector.class);
    }

     private final Provider<WebDriver> DRIVER_PROVIDER = new Provider<WebDriver>() {
         @Override
         public WebDriver get() {
             return new ChromeDriver(createChromeOptions());
         }

         private ChromeOptions createChromeOptions() {
             ChromeOptions options = new ChromeOptions();

             // see http://peter.sh/experiments/chromium-command-line-switches/
             String config = browserConfiguration.get(BrowserConfig.userAgent);
             if (config != null) {
                 options.addArguments("--user-agent" + "=" + config);
             }

             config = browserConfiguration.get(BrowserConfig.windowSize);
             if (config != null) {
                 config = config.replace("x", ",");
                 options.addArguments("--window-size" + "=" + config);
             }

             options.addArguments("--window-position=0,0");

             return options;
         }
     };
 }
