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

import com.google.inject.AbstractModule;
import com.google.inject.Provider;
import com.soulgalore.web.browsertime.SeleniumTimingRunner;
import com.soulgalore.web.browsertime.TimingRunner;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxProfile;

/**
 * Setup a module that uses Firefox.
 */
public class FireFoxModule extends AbstractModule {

    @Override
    protected void configure() {
        bind(WebDriver.class).toProvider(DRIVER_PROVIDER);
        bind(TimingRunner.class).to(SeleniumTimingRunner.class);
    }

    private static final Provider<WebDriver> DRIVER_PROVIDER = new Provider<WebDriver>() {
        @Override
        public WebDriver get() {
            return new FirefoxDriver(createNonCachingProfile());
        }

        private FirefoxProfile createNonCachingProfile() {
            FirefoxProfile profile = new FirefoxProfile();
            profile.setPreference("browser.cache.disk.enable", false);
            profile.setPreference("browser.cache.memory.enable", false);
            profile.setPreference("browser.cache.offline.enable", false);
            profile.setPreference("network.http.use-cache", false);

            return profile;
        }
    };
}
