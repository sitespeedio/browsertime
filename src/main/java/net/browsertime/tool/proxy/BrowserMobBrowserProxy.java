package net.browsertime.tool.proxy;

import java.net.UnknownHostException;
import java.util.Map;

import javax.annotation.Nullable;

import net.browsertime.tool.BasicAuth;
import net.browsertime.tool.Headers;
import net.lightbody.bmp.proxy.ProxyServer;

import org.openqa.selenium.Proxy;

import com.google.inject.Inject;

public class BrowserMobBrowserProxy implements BrowserProxy {
  private final ProxyServer proxyServer;
  private final BasicAuth basicAuth;
  private final Headers headers;

  @Inject
  public BrowserMobBrowserProxy(ProxyServer proxyServer, @Nullable BasicAuth basicAuth, @Nullable Headers headers) {
    this.proxyServer = proxyServer;
    this.basicAuth = basicAuth;
    this.headers = headers;
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
      if (headers!=null) {
        for (String key : headers.keyAndValues.keySet()) {
          proxyServer.addHeader(key, headers.keyAndValues.get(key));
        }
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
