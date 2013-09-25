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
import com.soulgalore.web.browsertime.guice.ChromeModule;
import com.soulgalore.web.browsertime.guice.FireFoxModule;
import com.soulgalore.web.browsertime.guice.InternetExplorerModule;
import com.soulgalore.web.browsertime.guice.JSONResultModule;
import com.soulgalore.web.browsertime.guice.XMLResultModule;
import com.soulgalore.web.browsertime.serializer.Serializer;
import com.soulgalore.web.browsertime.serializer.SerializerFactory;
import org.apache.commons.cli.CommandLine;
import org.apache.commons.cli.ParseException;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.Writer;

import static com.soulgalore.web.browsertime.run.CliHelper.Browser;
import static com.soulgalore.web.browsertime.run.CliHelper.DEFAULT_BROWSER;
import static com.soulgalore.web.browsertime.run.CliHelper.DEFAULT_FORMAT;
import static com.soulgalore.web.browsertime.run.CliHelper.Format;

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

        CliHelper cliHelper = new CliHelper();

        try {
            CommandLine line = cliHelper.parse(args);

            if (line.hasOption("h")) {
                shouldShowUsage = true;
            } else if (line.hasOption("version")) {
                cliHelper.printVersion();
            } else {
                cliHelper.validateArgValues(line);

                run(line);
            }
        } catch (NumberFormatException e) {
            commandStatus = ERROR;
            shouldShowUsage = true;
            cliHelper.printSyntaxError("Error parsing command line options: " + e.getMessage());
        } catch (ParseException e) {
            commandStatus = ERROR;
            shouldShowUsage = true;
            cliHelper.printSyntaxError("Error parsing command line options: " + e.getMessage());
        } catch (IOException e) {
            commandStatus = ERROR;
            cliHelper.printSyntaxError("Error creating output file. " + e.getMessage());
        }

        if (shouldShowUsage) {
            cliHelper.printUsage(cliHelper.getOptions());
        }

        return commandStatus;
    }

    private void run(CommandLine line) throws IOException {
        
    	String userAgent = line.getOptionValue("ua","");
        String windowSize = line.getOptionValue("w","");
    	
    	Injector injector = Guice.createInjector(
                createFormatModule(line.getOptionValue("f", DEFAULT_FORMAT.name())),
                createBrowserModule(line.getOptionValue("b", DEFAULT_BROWSER.name()),userAgent, windowSize));

        int numIterations = Integer.parseInt(line.getOptionValue("n", "3"));

        Writer writer = parseSerializationWriter(line.getOptionValue("o"));

        SerializerFactory factory = injector.getInstance(SerializerFactory.class);
        Serializer serializer = factory.create(writer);

        TimingController timer = injector.getInstance(TimingController.class);

        timer.performTiming(line.getArgs()[0], numIterations, serializer);
    }

    private Writer parseSerializationWriter(String filename) throws IOException {
        if (filename == null) {
            return new OutputStreamWriter(System.out);
        } else {
            File file = new File(filename);
            return new FileWriter(file);
        }
    }

    private Module createFormatModule(String name) {
        switch (Format.valueOf(name)) {
            case xml:
                return new XMLResultModule();
            case json:
                return new JSONResultModule();
            default:
                throw new RuntimeException();
        }
    }

    private Module createBrowserModule(String name, String userAgent, String windowSize) {
        switch (Browser.valueOf(name)) {
            case chrome:
                return new ChromeModule(userAgent, windowSize);
            case firefox:
                return new FireFoxModule();
            case ie:
                return new InternetExplorerModule();
            default:
                throw new RuntimeException();
        }
    }
}
