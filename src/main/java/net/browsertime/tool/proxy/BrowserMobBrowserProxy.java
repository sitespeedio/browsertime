package net.browsertime.tool.proxy;

import java.net.UnknownHostException;

import net.lightbody.bmp.proxy.ProxyServer;
import org.openqa.selenium.Proxy;

import com.google.inject.Inject;

public class BrowserMobBrowserProxy implements BrowserProxy {
  private final ProxyServer proxyServer;

  @Inject
  public BrowserMobBrowserProxy(ProxyServer proxyServer) {
    this.proxyServer = proxyServer;
  }

  @Override
  public Proxy toSeleniumProxy() {
    try {
      return proxyServer.seleniumProxy();
    } catch (UnknownHostException e) {
      throw new RuntimeException(e);
    }
  }

  @Override
  public void start() {
    try {
      proxyServer.start();
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  @Override
  public void stop() {
    try {
      proxyServer.stop();
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }
}
