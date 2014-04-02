package net.browsertime.tool.datacollector;

import com.google.inject.AbstractModule;
import com.google.inject.multibindings.Multibinder;

public class DataCollectorModule extends AbstractModule {

  @Override
  protected void configure() {
    Multibinder<TimingDataCollector> dataCollectorBinder = Multibinder.newSetBinder(binder(),
        TimingDataCollector.class);
    dataCollectorBinder.addBinding().to(NavigationTimingDataCollector.class);
    dataCollectorBinder.addBinding().toInstance(new UserTimingDataCollector(true));
    dataCollectorBinder.addBinding().to(BrowserTimeDataCollector.class);
    dataCollectorBinder.addBinding().to(ResourceTimingDataCollector.class);
  }
}
