package net.browsertime.tool.proxy;

import org.openqa.selenium.Proxy;

public class UpsteamHttpBrowserProxy implements BrowserProxy {
  private final String httpProxyHost;

  public UpsteamHttpBrowserProxy(String httpProxyHost) {
    this.httpProxyHost = httpProxyHost;
  }

  @Override
  public Proxy toSeleniumProxy() {
    Proxy proxy = new Proxy();
    proxy.setHttpProxy(httpProxyHost);
    return proxy;
  }

  @Override
  public void start() {

  }

  @Override
  public void stop() {

  }
}
