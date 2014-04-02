package net.browsertime.tool.har;

import java.io.IOException;
import java.io.Writer;

import net.lightbody.bmp.core.har.Har;
import net.lightbody.bmp.proxy.ProxyServer;

import com.google.inject.Inject;

public class BrowserMobHarGenerator implements HarGenerator {
  private final ProxyServer proxyServer;
  private int runCounter = 0;

  @Inject
  public BrowserMobHarGenerator(ProxyServer proxyServer) {
    this.proxyServer = proxyServer;
  }

  @Override
  public void startSession() {
  }

  @Override
  public void endSession() {
  }

  @Override
  public void startRun() {
    if (runCounter == 0) {
      proxyServer.newHar(generateNameForCurrentPage());
    } else {
      proxyServer.newPage(generateNameForCurrentPage());
    }
    runCounter++;
  }

  @Override
  public void endRun() {
    proxyServer.endPage();
  }

  @Override
  public void writeHar(Writer writer) throws IOException {
    Har har = proxyServer.getHar();
    har.writeTo(writer);
  }

  private String generateNameForCurrentPage() {
    return "Run " + (runCounter + 1);
  }
}
