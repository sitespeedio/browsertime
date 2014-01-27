package net.browsertime.tool.webdriver;

import net.browsertime.tool.BrowserConfig;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.ie.InternetExplorerDriver;
import org.openqa.selenium.os.CommandLine;
import org.openqa.selenium.remote.DesiredCapabilities;

import java.util.Map;

public class InternetExplorerDriverProvider extends WebDriverProvider {
  public InternetExplorerDriverProvider(Map<BrowserConfig, String> browserConfiguration) {
    super(browserConfiguration);
  }

  @Override
  public void validateProvider() throws WebDriverValidationException {
    String path = CommandLine.find("IEDriverServer");
    if (path == null) {
      throw new WebDriverValidationException("Can't find IEDriverServer. "
          + "Download it from http://code.google.com/p/selenium/downloads/list and place it in your PATH.");
    }
  }

  @Override
  public WebDriver get() {
    DesiredCapabilities capabilities = createCapabilities();
    capabilities.setCapability(InternetExplorerDriver.IE_ENSURE_CLEAN_SESSION, true);
    capabilities.setCapability(InternetExplorerDriver.IGNORE_ZOOM_SETTING, true);
    return new InternetExplorerDriver(capabilities);
  }

  @Override
  protected DesiredCapabilities getBrowserCapabilities() {
    return DesiredCapabilities.internetExplorer();
  }
}
