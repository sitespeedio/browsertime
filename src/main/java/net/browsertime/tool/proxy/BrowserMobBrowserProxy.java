package net.browsertime.tool.proxy;

import java.net.UnknownHostException;

import javax.annotation.Nullable;

import net.browsertime.tool.BasicAuth;
import net.lightbody.bmp.proxy.ProxyServer;
import org.openqa.selenium.Proxy;

import com.google.inject.Inject;

public class BrowserMobBrowserProxy implements BrowserProxy {
  private final ProxyServer proxyServer;
  private final BasicAuth basicAuth;

  @Inject
  public BrowserMobBrowserProxy(ProxyServer proxyServer, @Nullable BasicAuth basicAuth) {
    this.proxyServer = proxyServer;
    this.basicAuth = basicAuth;
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
      proxyServer.setCaptureHeaders(true);
      if (basicAuth != null) {
        proxyServer.autoBasicAuthorization(basicAuth.domain, basicAuth.username, basicAuth.password);
      }
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
