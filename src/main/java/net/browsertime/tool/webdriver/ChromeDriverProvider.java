package net.browsertime.tool.webdriver;

import static org.openqa.selenium.chrome.ChromeDriverService.CHROME_DRIVER_SILENT_OUTPUT_PROPERTY;
import static org.openqa.selenium.chrome.ChromeDriverService.CHROME_DRIVER_VERBOSE_LOG_PROPERTY;

import java.util.Map;

import net.browsertime.tool.BrowserConfig;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.os.CommandLine;
import org.openqa.selenium.remote.DesiredCapabilities;

import com.google.inject.Inject;
import com.google.inject.name.Named;

public class ChromeDriverProvider extends WebDriverProvider {
  @Inject @Named("debugMode") private boolean debugMode;

  public ChromeDriverProvider(Map<BrowserConfig, String> browserConfiguration) {
    super(browserConfiguration);
  }

  @SuppressWarnings("deprecation")
  @Override
  public void validateProvider() throws WebDriverValidationException {
    String path = CommandLine.find("chromedriver");
    if (path == null) {
      throw new WebDriverValidationException(
          "Can't find chromedriver. "
              + "Download it from http://chromedriver.storage.googleapis.com/index.html and place it in your PATH.");
    }
  }

  @Override
  public WebDriver get() {
    DesiredCapabilities capabilities = createCapabilities();
    capabilities.setCapability(ChromeOptions.CAPABILITY, createChromeOptions());
    System.setProperty(CHROME_DRIVER_SILENT_OUTPUT_PROPERTY, Boolean.toString(!debugMode));
    System.setProperty(CHROME_DRIVER_VERBOSE_LOG_PROPERTY, Boolean.toString(debugMode));
    return new ChromeDriver(capabilities);
  }

  private ChromeOptions createChromeOptions() {
    ChromeOptions options = new ChromeOptions();

    // see http://peter.sh/experiments/chromium-command-line-switches/
    String config = browserConfiguration.get(BrowserConfig.userAgent);
    if (config != null) {
      options.addArguments("--user-agent=" + config);
    }

    config = browserConfiguration.get(BrowserConfig.windowSize);
    if (config != null) {
      config = config.replace("x", ",");
      options.addArguments("--window-size=" + config);
    }

    options.addArguments("--window-position=0,0");

    return options;
  }

  @Override
  protected DesiredCapabilities getBrowserCapabilities() {
    return DesiredCapabilities.chrome();
  }
}
