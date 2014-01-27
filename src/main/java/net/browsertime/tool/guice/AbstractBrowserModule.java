package net.browsertime.tool.guice;

import com.google.inject.AbstractModule;
import net.browsertime.tool.BrowserConfig;
import net.browsertime.tool.timingrunner.SeleniumTimingRunner;
import net.browsertime.tool.timingrunner.TimingRunner;

import java.util.HashMap;
import java.util.Map;

public abstract class AbstractBrowserModule extends AbstractModule {

  protected Map<BrowserConfig, String> browserConfiguration;

  protected AbstractBrowserModule(Map<BrowserConfig, String> browserConfiguration) {
    this.browserConfiguration = new HashMap<BrowserConfig, String>(browserConfiguration);
  }

  protected void configure() {
    bind(TimingRunner.class).to(SeleniumTimingRunner.class);
  }

  /**
   * Prohibit use of no-args constructor.
   */
  @SuppressWarnings("UnusedDeclaration")
  private AbstractBrowserModule() {}
}
