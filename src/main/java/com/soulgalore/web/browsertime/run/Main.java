 /*******************************************************************************************************************************
 * It's Browser Time!
 * 
 *
 * Copyright (C) 2013 by Tobias Lidskog (https://twitter.com/tobiaslidskog) &  Peter Hedenskog (http://peterhedenskog.com)
 *
 ********************************************************************************************************************************
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in 
 * compliance with the License. You may obtain a copy of the License at
 * 
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is 
 * distributed  on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.   
 * See the License for the specific language governing permissions and limitations under the License.
 *
 ********************************************************************************************************************************
 */
package com.soulgalore.web.browsertime.run;

import com.google.inject.Guice;
import com.google.inject.Injector;
import com.google.inject.Module;
import com.soulgalore.web.browsertime.TimingRunner;
import com.soulgalore.web.browsertime.guice.*;
import com.soulgalore.web.browsertime.serializer.Serializer;
import com.soulgalore.web.browsertime.serializer.SerializerFactory;
import com.soulgalore.web.browsertime.timings.TimingSession;
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
                parser.printVersion();
            } else {
                TimingConfig config = parser.parseTimingConfig();
                URL url = parser.parseUrl();
                run(config, url);
            }
        } catch (ParseException e) {
            commandStatus = ERROR;
            shouldShowUsage = true;
            printSyntaxError("Error parsing command line options: " + e.getMessage());
        } catch (IOException e) {
            commandStatus = ERROR;
            printSyntaxError("Error creating output file. " + e.getMessage());
        }

        if (shouldShowUsage) {
            parser.printUsage();
        }

        return commandStatus;
    }

     private void run(TimingConfig config, URL url) throws IOException {
         Injector injector = createInjector(config);

         TimingRunner timingRunner = injector.getInstance(TimingRunner.class);
         SerializerFactory factory = injector.getInstance(SerializerFactory.class);
         Serializer serializer = factory.create(config.outputWriter, config.shouldPrettyPrint);

         TimingSession session = timingRunner.run(url, config.numIterations);
         serializer.serialize(session);
     }

     void printSyntaxError(String s) {
         System.err.println(s);
     }

     private Injector createInjector(TimingConfig config) {
         return Guice.createInjector(createFormatModule(config), createBrowserModule(config));
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
