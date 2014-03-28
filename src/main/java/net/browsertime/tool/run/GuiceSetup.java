package net.browsertime.tool.run;

import net.browsertime.tool.guice.ChromeModule;
import net.browsertime.tool.guice.FireFoxModule;
import net.browsertime.tool.guice.InternetExplorerModule;
import net.browsertime.tool.guice.JSONResultModule;
import net.browsertime.tool.guice.XMLResultModule;
import net.browsertime.tool.logger.ConsoleLogger;
import net.browsertime.tool.logger.Logger;

import com.google.inject.AbstractModule;
import com.google.inject.Module;

public class GuiceSetup {
    static Module[] setupModules(TimingConfig config) {
        return new Module[] {
            createToolModule(config),
            createBrowserModule(config),
            createFormatModule(config)
        };
    }

    private static Module createToolModule(final TimingConfig config) {
        return new AbstractModule() {
            @Override
            protected void configure() {
                bind(Logger.class).toInstance(new ConsoleLogger(config.verbose, config.debug));
            }
        };
    }

    private static Module createFormatModule(TimingConfig config) {
        switch (config.format) {
            case xml:
                return new XMLResultModule();
            case json:
                return new JSONResultModule();
            default:
                throw new RuntimeException("Unsupported format: " + config.format);
        }
    }

    private static Module createBrowserModule(TimingConfig config) {
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
