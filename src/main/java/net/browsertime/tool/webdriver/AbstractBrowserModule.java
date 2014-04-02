package net.browsertime.tool.webdriver;

import java.util.HashMap;
import java.util.Map;

import net.browsertime.tool.BrowserConfig;

import com.google.inject.AbstractModule;

abstract class AbstractBrowserModule extends AbstractModule {

  Map<BrowserConfig, String> browserConfiguration;

  AbstractBrowserModule(Map<BrowserConfig, String> browserConfiguration) {
    this.browserConfiguration = new HashMap<BrowserConfig, String>(browserConfiguration);
  }

  /**
   * Prohibit use of no-args constructor.
   */
  @SuppressWarnings("UnusedDeclaration")
  private AbstractBrowserModule() {}
}
