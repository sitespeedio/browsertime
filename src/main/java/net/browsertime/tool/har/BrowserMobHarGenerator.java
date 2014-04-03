package net.browsertime.tool.har;

import java.io.IOException;
import java.io.Writer;
import java.util.Map;

import net.browsertime.tool.timings.TimingSession;
import net.lightbody.bmp.core.har.Har;
import net.lightbody.bmp.core.har.HarLog;
import net.lightbody.bmp.core.har.HarNameVersion;
import net.lightbody.bmp.core.har.HarPage;
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
  public void addTimingDataToHar(TimingSession session) {
    HarLog log = proxyServer.getHar().getLog();

    Map<String, String> pageData = session.getPageData();

    HarNameVersion creator = log.getCreator();
    creator.setName("Browsertime");
    creator.setVersion(pageData.get("browserTimeVersion"));
    creator.setComment("Created using BrowserMob Proxy");

    HarNameVersion browser = log.getBrowser();
    browser.setName(pageData.get("browserName"));
    browser.setVersion(pageData.get("browserVersion"));

    for (HarPage harPage : log.getPages()) {
      harPage.setComment(pageData.get("url"));
    }
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
