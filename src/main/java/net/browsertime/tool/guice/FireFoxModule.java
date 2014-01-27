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
package net.browsertime.tool.guice;

import com.google.inject.Provider;
import net.browsertime.tool.BrowserConfig;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxBinary;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxProfile;

import java.util.Map;

/**
 * Setup a module that uses Firefox.
 */
public class FireFoxModule extends AbstractBrowserModule {

  public FireFoxModule(Map<BrowserConfig, String> browserConfiguration) {
    super(browserConfiguration);
  }

  @Override
  protected void configure() {
    super.configure();

    bind(WebDriver.class).toProvider(DRIVER_PROVIDER);
  }

  private final Provider<WebDriver> DRIVER_PROVIDER = new Provider<WebDriver>() {

    @Override
    public WebDriver get() {
      return new FirefoxDriver(createBinary(), createProfile());
    }

    private FirefoxBinary createBinary() {
      FirefoxBinary binary = new FirefoxBinary();
      String windowSize = browserConfiguration.get(BrowserConfig.windowSize);
      if (windowSize != null) {
        String[] parts = windowSize.split("x");
        binary.addCommandLineOptions("-width", parts[0], "-height", parts[1]);
      }

      return binary;
    }

    private FirefoxProfile createProfile() {
      FirefoxProfile profile = new FirefoxProfile();

      // http://kb.mozillazine.org/Firefox_:_FAQs_:_About:config_Entries
      profile.setPreference("browser.cache.disk.enable", false);
      profile.setPreference("browser.cache.memory.enable", false);
      profile.setPreference("browser.cache.offline.enable", false);
      profile.setPreference("network.http.use-cache", false);

      String userAgent = browserConfiguration.get(BrowserConfig.userAgent);
      if (userAgent != null) {
        profile.setPreference("general.useragent.override", userAgent);
      }

      return profile;
    }
  };
}
