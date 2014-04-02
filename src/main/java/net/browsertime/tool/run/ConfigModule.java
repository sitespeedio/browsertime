package net.browsertime.tool.run;

import net.browsertime.tool.BasicAuth;

import com.google.inject.AbstractModule;
import com.google.inject.name.Names;

public class ConfigModule extends AbstractModule {
  private TimingConfig config;

  public ConfigModule(TimingConfig config) {
    this.config = config;
  }

  @Override
  protected void configure() {
    bind(Boolean.class).annotatedWith(Names.named("prettyPrint"))
        .toInstance(config.shouldPrettyPrint);
    bind(Boolean.class).annotatedWith(Names.named("includeRuns"))
        .toInstance(config.shouldIncludeRuns);
    bind(Integer.class).annotatedWith(Names.named("timeoutSeconds"))
        .toInstance(config.timeoutSeconds);
    if (config.basicAuth != null) {
      bind(BasicAuth.class).toInstance(config.basicAuth);
    }
  }
}
