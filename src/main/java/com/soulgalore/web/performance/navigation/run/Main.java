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
                createFormatModule(line.getOptionValue("f", "xml")),
                createBrowserModule(line.getOptionValue("b", "firefox")));

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
        if ("xml".equals(format)) {
            return new XMLResultModule();
        } else if ("json".equals(format)) {
            return new JSONResultModule();
        }
        throw new RuntimeException();
    }

    private Module createBrowserModule(String browser) {
        if ("chrome".equals(browser)) {
            return new ChromeModule();
        } else if ("firefox".equals(browser)) {
            return new FireFoxModule();
        } else if ("ie".equals(browser)) {
            return new InternetExplorerModule();
        }
        throw new RuntimeException();
    }
}
