package net.browsertime.tool.guice;

import net.browsertime.tool.logger.ConsoleLogger;
import net.browsertime.tool.logger.Logger;
import net.browsertime.tool.run.ConfigModule;
import net.browsertime.tool.run.TimingConfig;
import net.browsertime.tool.serializer.JSONResultModule;
import net.browsertime.tool.serializer.XMLResultModule;

import com.google.inject.AbstractModule;
import com.google.inject.Module;

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
    install(new ConfigModule(config));
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
