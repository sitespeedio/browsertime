/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

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

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.chrome.ChromeDriverService;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.FileDetector;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.service.DriverCommandExecutor;
import org.openqa.selenium.remote.service.DriverService;

/**
 * NOTE
 * This file is a copy of org.openqa.selenium.chrome.ChromeDriver with some changes to support
 * SilentChromeDriverService.
 * Once the next Selenium release that includes https://github.com/SeleniumHQ/selenium/commit/77876ccd1cb817b9627f279a3f637532d02aa0d1
 * is released this class shouldn't be needed.
 *
 * A {@link WebDriver} implementation that controls a Chrome browser running on the local machine.
 * This class is provided as a convenience for easily testing the Chrome browser. The control server
 * which each instance communicates with will live and die with the instance.
 *
 * <p/>
 * To avoid unnecessarily restarting the ChromeDriver server with each instance, use a
 * {@link RemoteWebDriver} coupled with the desired {@link ChromeDriverService}, which is managed
 * separately. For example: <code><pre>
 *
 * import static org.junit.Assert.assertEquals;
 *
 * import org.junit.After;
 * import org.junit.AfterClass;
 * import org.junit.Before;
 * import org.junit.BeforeClass;
 * import org.junit.runner.RunWith;
 * import org.junit.runners.BlockJUnit4ClassRunner
 * import org.openqa.selenium.chrome.ChromeDriverService;
 * import org.openqa.selenium.remote.DesiredCapabilities;
 * import org.openqa.selenium.remote.RemoteWebDriver;
 *
 * {@literal @RunWith(BlockJUnit4ClassRunner.class)}
 * public class ChromeTest extends TestCase {
 *
 *   private static ChromeDriverService service;
 *   private WebDriver driver;
 *
 *   {@literal @BeforeClass}
 *   public static void createAndStartService() {
 *     service = new ChromeDriverService.Builder()
 *         .usingChromeDriverExecutable(new File("path/to/my/chromedriver.exe"))
 *         .usingAnyFreePort()
 *         .build();
 *     service.start();
 *   }
 *
 *   {@literal @AfterClass}
 *   public static void createAndStopService() {
 *     service.stop();
 *   }
 *
 *   {@literal @Before}
 *   public void createDriver() {
 *     driver = new RemoteWebDriver(service.getUrl(),
 *         DesiredCapabilities.chrome());
 *   }
 *
 *   {@literal @After}
 *   public void quitDriver() {
 *     driver.quit();
 *   }
 *
 *   {@literal @Test}
 *   public void testGoogleSearch() {
 *     driver.get("http://www.google.com");
 *     WebElement searchBox = driver.findElement(By.name("q"));
 *     searchBox.sendKeys("webdriver");
 *     searchBox.quit();
 *     assertEquals("webdriver - Google Search", driver.getTitle());
 *   }
 * }
 *
 * </pre></code>
 *
 * @see ChromeDriverService#createDefaultService
 */
public class ChromeDriver extends RemoteWebDriver implements TakesScreenshot {

  /**
   * Creates a new ChromeDriver instance. The {@code service} will be started along with the
   * driver, and shutdown upon calling {@link #quit()}.
   *
   * @param service The service to use.
   * @param capabilities The capabilities required from the ChromeDriver.
   */
  public ChromeDriver(DriverService service, Capabilities capabilities) {
    super(new DriverCommandExecutor(service), capabilities);
  }

  @Override
  public void setFileDetector(FileDetector detector) {
    throw new WebDriverException(
            "Setting the file detector only works on remote webdriver instances obtained " +
                    "via RemoteWebDriver");
  }

  public <X> X getScreenshotAs(OutputType<X> target) {
    // Get the screenshot as base64.
    String base64 = (String) execute(DriverCommand.SCREENSHOT).getValue();
    // ... and convert it.
    return target.convertFromBase64Png(base64);
  }

  @Override
  protected void startSession(Capabilities desiredCapabilities,
                              Capabilities requiredCapabilities) {
    try {
      super.startSession(desiredCapabilities, requiredCapabilities);
    } catch (WebDriverException e) {
      try {
        quit();
      } catch (Throwable t) {
        // Ignoring to report the exception thrown earlier.
      }

      throw e;
    }
  }
}
