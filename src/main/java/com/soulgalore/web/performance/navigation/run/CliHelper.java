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

import org.apache.commons.cli.*;

import java.util.Arrays;
import java.util.List;

/**
 *
 */
class CliHelper {
    private static final List<String> VALID_BROWSERS = Arrays.asList("firefox", "chrome", "ie");
    private static final List<String> VALID_FORMATS = Arrays.asList("xml", "json");

    private final Options options;

    public CliHelper() {
        options = new Options();
    }

    public CommandLine parse(String[] args) throws ParseException {
        setupOptions(options);
        Parser parser = new BasicParser();
        return parser.parse(options, args);
    }

    public Options getOptions() {
        return options;
    }

    public void validateArgValues(CommandLine line) throws ParseException {
        String[] urlArgs = line.getArgs();
        if (urlArgs.length != 1) {
            throw new ParseException("One url must be passed as the last argument.");
        } else {
            validateBrowserOption(line);
            validateFormatOption(line);
            validateTimesOption(line);
        }
    }

    private void setupOptions(Options options) {
        options.addOption(createTimesOption());
        options.addOption(createBrowserOption());
        options.addOption(createOutputOption());
        options.addOption(createIncludeOption());
        options.addOption(createFormatOption());
        options.addOption(createHelpOption());
        options.addOption(createVersionOption());
    }

    private Option createTimesOption() {
        return createOption("n", "times",
                "The number of times to run the test, defaults to 3.");
    }

    private Option createBrowserOption() {
        return createOption("b", "browser",
                "The browser to use [chrome|firefox|ie], defaults to firefox.");
    }

    private Option createOutputOption() {
        return createOption("o", "output",
                "Output the result as a file, give the name of the file. " +
                        "If no filename is given, the result is put on standard out.");
    }

    private Option createIncludeOption() {
        return createOption("i", "include",
                "Include individual runs in the data output. [true|false], defaults to false.");
    }

    private Option createFormatOption() {
        return createOption("f", "format",
                "Choose output format. [xml|json], defaults to xml.");
    }

    private Option createHelpOption() {
        Option option = createOption("h", "help",
                "Show this help message");
        option.setArgs(0);
        return option;
    }

    private Option createVersionOption() {
        Option option = createOption("V", "version",
                "Show version information");
        option.setArgs(0);
        return option;
    }

    /**
     * Create an optional Option with one argument.
     */
    private Option createOption(String opt, String longName, String description) {
        final Option option = new Option(opt, description);
        option.setLongOpt(longName);
        option.setArgName(longName.toUpperCase());
        option.setRequired(false);
        option.setArgs(1);
        return option;
    }


    void validateBrowserOption(CommandLine line) throws ParseException {
        String browser = line.getOptionValue("b");
        if (!(browser == null || VALID_BROWSERS.contains(browser))) {
            throw new ParseException("Invalid browser: " + browser);
        }
    }

    void validateFormatOption(CommandLine line) throws ParseException {
        String format = line.getOptionValue("f");
        if (!(format == null || VALID_FORMATS.contains(format))) {
            throw new ParseException("Invalid format: " + format);
        }
    }

    private void validateTimesOption(CommandLine line) throws ParseException {
        String times = line.getOptionValue("n");
        if (times != null) {
            try {
                int i = Integer.parseInt(times);
                if (i <= 0) {
                    throw new ParseException("Must specify >= 1 runs.");
                }
            } catch (NumberFormatException e) {
                throw new ParseException("Invalid number: " + times);
            }
        }
    }

    void printSyntaxError(String s) {
        System.err.println(s);
    }

    void printUsage(Options options) {
        HelpFormatter helpFormatter = new HelpFormatter();
        helpFormatter.printHelp("browsertime [options] URL", options);
    }

    void printVersion() {
        System.out.println(getClass().getPackage().getImplementationVersion());
    }

}
