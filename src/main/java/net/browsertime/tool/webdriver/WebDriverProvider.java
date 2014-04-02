package net.browsertime.tool.webdriver;

import java.util.Map;
import javax.annotation.Nullable;

import net.browsertime.tool.BrowserConfig;
import net.browsertime.tool.proxy.BrowserProxy;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;

import com.google.inject.Inject;
import com.google.inject.Provider;

abstract public class WebDriverProvider implements Provider<WebDriver> {
  final Map<BrowserConfig, String> browserConfiguration;
  @Inject @Nullable
  private BrowserProxy browserProxy;

  WebDriverProvider(Map<BrowserConfig, String> browserConfiguration) {
    this.browserConfiguration = browserConfiguration;
  }

  protected DesiredCapabilities createCapabilities() {
    DesiredCapabilities c = getBrowserCapabilities();

    setProxyCapability(c);

    return c;
  }

  protected abstract DesiredCapabilities getBrowserCapabilities();

  /**
   * Validate that the provider can run, e.g. that external dependencies as fulfilled.
   * 
   * @throws WebDriverValidationException if provider isn't able to run.
   */
  public abstract void validateProvider() throws WebDriverValidationException;

  private void setProxyCapability(DesiredCapabilities c) {
    if (browserProxy != null) {
      c.setCapability(CapabilityType.PROXY, browserProxy.toSeleniumProxy());
    }
  }
}
