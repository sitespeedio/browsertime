/*
Copyright 2011-2012 Selenium committers
Copyright 2011-2012 Software Freedom Conservancy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */

package net.browsertime.tool.webdriver;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import org.openqa.selenium.chrome.ChromeDriverService;

import java.io.File;
import java.io.IOException;

public class SilentChromeDriverService extends ChromeDriverService {

    /**
     * @param executable  The chromedriver executable.
     * @param port        Which port to start the chromedriver on.
     * @param args        The arguments to the launched server.
     * @param environment The environment for the launched server.
     * @throws java.io.IOException If an I/O error occurs.
     */
    public SilentChromeDriverService(File executable, int port, ImmutableList<String> args, ImmutableMap<String, String> environment) throws IOException {
        super(executable, port, args, environment);
    }

    /**
     * Configures and returns a new {@link ChromeDriverService} using the default configuration. In
     * this configuration, the service will use the chromedriver executable identified by the
     * {@link #CHROME_DRIVER_EXE_PROPERTY} system property. Each service created by this method will
     * be configured to use a free port on the current system.
     *
     * @return A new ChromeDriverService.
     */
    public static ChromeDriverService createSilentService() {
        File exe = findExecutable("chromedriver", CHROME_DRIVER_EXE_PROPERTY,
            "http://code.google.com/p/selenium/wiki/ChromeDriver",
            "http://chromedriver.storage.googleapis.com/index.html");
        return new Builder().usingDriverExecutable(exe).usingAnyFreePort().withSilent(true).build();
    }
}
