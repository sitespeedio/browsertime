package net.browsertime.tool.proxy;

import org.openqa.selenium.Proxy;

public interface BrowserProxy {
  Proxy toSeleniumProxy();

  void start();
  void stop();
}
