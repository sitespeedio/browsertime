package net.browsertime.tool;

import net.browsertime.tool.datacollector.DataCollectorModule;
import net.browsertime.tool.har.BrowserMobHarGenerator;
import net.browsertime.tool.har.HarGenerator;
import net.browsertime.tool.logger.ConsoleLogger;
import net.browsertime.tool.logger.Logger;
import net.browsertime.tool.proxy.BrowserMobBrowserProxy;
import net.browsertime.tool.proxy.BrowserProxy;
import net.browsertime.tool.proxy.UpsteamHttpBrowserProxy;
import net.browsertime.tool.run.ConfigModule;
import net.browsertime.tool.run.TimingConfig;
import net.browsertime.tool.serializer.JSONResultModule;
import net.browsertime.tool.serializer.XMLResultModule;
import net.browsertime.tool.timingrunner.SeleniumTimingRunner;
import net.browsertime.tool.timingrunner.TimingRunner;
import net.browsertime.tool.webdriver.ChromeModule;
import net.browsertime.tool.webdriver.FireFoxModule;
import net.browsertime.tool.webdriver.InternetExplorerModule;
import net.lightbody.bmp.proxy.ProxyServer;

import com.google.inject.AbstractModule;
import com.google.inject.Module;
import com.google.inject.util.Providers;

public class BrowserTimeModule extends AbstractModule {
  private TimingConfig config;

  public BrowserTimeModule(TimingConfig config) {
    this.config = config;
  }

  @Override
  protected void configure() {
    install(createBrowserModule(config));
    install(createFormatModule(config));
    install(createToolModule(config));
    install(createProxyModule(config));
    install(new ConfigModule(config));
    install(new DataCollectorModule());

    bind(TimingRunner.class).to(SeleniumTimingRunner.class);
  }

  private Module createProxyModule(final TimingConfig config) {
    return new AbstractModule() {
      @Override
      protected void configure() {
        String proxyHost = config.browserOptions.get(BrowserConfig.proxyHost);

        if (config.harWriter != null) {
          bind(ProxyServer.class).toInstance(new ProxyServer(0));
          bind(HarGenerator.class).to(BrowserMobHarGenerator.class);
          bind(BrowserProxy.class).to(BrowserMobBrowserProxy.class);

          if (proxyHost != null) {
            throw new IllegalArgumentException("Using an upstream proxy is currently not " +
                "supported when generating a har file.");
          }
        } else {
          bind(HarGenerator.class).toProvider(Providers.<HarGenerator>of(null));

          if (proxyHost != null) {
            bind(BrowserProxy.class).toInstance(new UpsteamHttpBrowserProxy(proxyHost));
          } else {
            bind(BrowserProxy.class).toProvider(Providers.<BrowserProxy>of(null));
          }
        }
      }
    };
  }

  private Module createToolModule(final TimingConfig config) {
    return new AbstractModule() {
      @Override
      protected void configure() {
        bind(Logger.class).toInstance(new ConsoleLogger(config.verbose, config.debug));
      }
    };
  }

  private Module createFormatModule(TimingConfig config) {
    switch (config.format) {
      case xml:
        return new XMLResultModule();
      case json:
        return new JSONResultModule();
      default:
        throw new RuntimeException("Unsupported format: " + config.format);
    }
  }

  private Module createBrowserModule(TimingConfig config) {
    switch (config.browser) {
      case chrome:
        return new ChromeModule(config.browserOptions);
      case firefox:
        return new FireFoxModule(config.browserOptions);
      case ie:
        return new InternetExplorerModule(config.browserOptions);
      default:
        throw new RuntimeException("Unsupported browser: " + config.browser);
    }
  }
}
