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
package com.soulgalore.web.performance.navigation.run;

import com.google.inject.Guice;
import com.google.inject.Injector;
import com.google.inject.Module;
import com.soulgalore.web.performance.navigation.guice.*;
import com.soulgalore.web.performance.navigation.serializer.Serializer;
import com.soulgalore.web.performance.navigation.serializer.SerializerFactory;
import org.apache.commons.cli.CommandLine;
import org.apache.commons.cli.ParseException;

import java.io.*;

/**
 *
 */
public class Main {
    public static void main(String[] args) {
        Main app = new Main();
        int status = app.handleCommandLine(args);

        System.exit(status);
    }

    int handleCommandLine(String[] args) {
        int commandStatus = 0;
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
            commandStatus = 1;
            shouldShowUsage = true;
            cliHelper.printSyntaxError("Error parsing command line options: " + e.getMessage());
        } catch (ParseException e) {
            commandStatus = 1;
            shouldShowUsage = true;
            cliHelper.printSyntaxError("Error parsing command line options: " + e.getMessage());
        } catch (IOException e) {
            commandStatus = 1;
            cliHelper.printSyntaxError("Error creating output file. " + e.getMessage());
        }

        if (shouldShowUsage) {
            cliHelper.printUsage(cliHelper.getOptions());
        }

        return commandStatus;
    }

    private void run(CommandLine line) throws IOException {
        Injector injector = Guice.createInjector(
                createFormatModule(line.getOptionValue("f", CliHelper.XML)),
                createBrowserModule(line.getOptionValue("b", CliHelper.FIREFOX)));

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
            file.createNewFile();
            return new FileWriter(filename);
        }
    }

    private Module createFormatModule(String format) {
        if (CliHelper.XML.equals(format)) {
            return new XMLResultModule();
        } else if (CliHelper.JSON.equals(format)) {
            return new JSONResultModule();
        }
        throw new RuntimeException();
    }

    private Module createBrowserModule(String browser) {
        if (CliHelper.CHROME.equals(browser)) {
            return new ChromeModule();
        } else if (CliHelper.FIREFOX.equals(browser)) {
            return new FireFoxModule();
        } else if (CliHelper.IE.equals(browser)) {
            return new InternetExplorerModule();
        }
        throw new RuntimeException();
    }
}
