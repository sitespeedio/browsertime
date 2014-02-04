/*******************************************************************************************************************************
 * It's Browser Time!
 * 
 * 
 * Copyright (C) 2013 by Tobias Lidskog (https://twitter.com/tobiaslidskog) & Peter Hedenskog
 * (http://peterhedenskog.com)
 * 
 ******************************************************************************************************************************** 
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 * 
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 * 
 ******************************************************************************************************************************** 
 */
package net.browsertime.tool.run;

import static com.google.inject.name.Names.named;

import com.google.inject.AbstractModule;
import com.google.inject.Guice;
import com.google.inject.Injector;
import com.google.inject.Module;
import net.browsertime.tool.BrowserTimeException;
import net.browsertime.tool.guice.ChromeModule;
import net.browsertime.tool.guice.FireFoxModule;
import net.browsertime.tool.guice.InternetExplorerModule;
import net.browsertime.tool.guice.JSONResultModule;
import net.browsertime.tool.guice.XMLResultModule;
import net.browsertime.tool.serializer.Serializer;
import net.browsertime.tool.serializer.SerializerFactory;
import net.browsertime.tool.timingrunner.TimingRunner;
import net.browsertime.tool.timings.TimingSession;
import net.browsertime.tool.webdriver.WebDriverValidationException;
import org.apache.commons.cli.ParseException;

import java.io.IOException;
import java.net.URL;

/**
 *
 */
public class Main {

  public static final int ERROR = 1;
  public static final int OK = 0;

  public static void main(String[] args) {
    Main app = new Main();
    int status = app.handleCommandLine(args);

    System.exit(status);
  }

  int handleCommandLine(String[] args) {
    int commandStatus = OK;
    boolean shouldShowUsage = false;

    CliParser parser = new CliParser();

    try {
      parser.parseArgs(args);

      if (parser.shouldShowHelp()) {
        shouldShowUsage = true;
      } else if (parser.shouldShowVersion()) {
        System.out.println(Version.getVersion());
      } else {
        TimingConfig config = parser.parseTimingConfig();
        URL url = parser.parseUrl();
        run(url, config);
      }
    } catch (ParseException e) {
      commandStatus = ERROR;
      shouldShowUsage = true;
      printSyntaxError("Error parsing command line options: " + e.getMessage());
    } catch (IOException e) {
      commandStatus = ERROR;
      printSyntaxError("Error creating output file: " + e.getMessage());
    } catch (WebDriverValidationException e) {
      commandStatus = ERROR;
      printSyntaxError(e.getMessage());
    } catch (BrowserTimeException e) {
      commandStatus = ERROR;
      // This is something serious, print the stacktrace so we know what is happening
      e.printStackTrace();
    }

    if (shouldShowUsage) {
      parser.printUsage();
    }

    return commandStatus;
  }

  private void run(URL url, TimingConfig config) throws IOException, BrowserTimeException {
    Injector injector = createInjector(config);

    TimingRunner timingRunner = injector.getInstance(TimingRunner.class);
    SerializerFactory factory = injector.getInstance(SerializerFactory.class);
    Serializer serializer =
        factory.create(config.outputWriter, config.shouldPrettyPrint, config.shouldIncludeRuns);

    TimingSession session = timingRunner.run(url, config.numIterations, config.timeoutSeconds);
    serializer.serialize(session);
  }

  void printSyntaxError(String s) {
    System.err.println(s);
  }

  private Injector createInjector(TimingConfig config) {
    return Guice.createInjector(createToolModule(config), createFormatModule(config),
        createBrowserModule(config));
  }

  private Module createToolModule(final TimingConfig config) {
    return new AbstractModule() {
      @Override
      protected void configure() {
        bindConstant().annotatedWith(named("verbose")).to(config.verbose);
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
