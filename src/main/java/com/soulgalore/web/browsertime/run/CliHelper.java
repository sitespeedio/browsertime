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

import org.apache.commons.cli.BasicParser;
import org.apache.commons.cli.CommandLine;
import org.apache.commons.cli.HelpFormatter;
import org.apache.commons.cli.Option;
import org.apache.commons.cli.Options;
import org.apache.commons.cli.ParseException;
import org.apache.commons.cli.Parser;

import static java.util.Arrays.asList;

/**
 *
 */
class CliHelper {

    enum Browser { chrome, firefox, ie }
    enum Format { xml, json }

    public static final Browser DEFAULT_BROWSER = Browser.firefox;
    public static final Format DEFAULT_FORMAT = Format.xml;

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
        }

        validateBrowserOption(line);
        validateFormatOption(line);
        validateIterationsOption(line);
        validateWindowSizeOption(line);
    }

    private void setupOptions(Options options) {
        options.addOption(createIterationsOption());
        options.addOption(createBrowserOption());
        options.addOption(createOutputOption());
        options.addOption(createFormatOption());
        options.addOption(createCompactOption());
        options.addOption(createUserAgentOption());
        options.addOption(createWindowSizeOption());
        options.addOption(createHelpOption());
        options.addOption(createVersionOption());
    }

    private Option createIterationsOption() {
        return createOption("n", "times",
                "The number of times to run the test, default being 3.");
    }

    private Option createBrowserOption() {
        return createOption("b", "browser",
                "The browser to use. Supported values are: " + asList(Browser.values()) +
                        ", default being " + DEFAULT_BROWSER + ".");
    }

    private Option createOutputOption() {
        return createOption("o", "output",
                "Output the result as a file, give the name of the file. " +
                        "If no filename is given, the result is put on standard out.");
    }


    private Option createFormatOption() {
        return createOption("f", "format",
                "The desired output format. Supported values are: " + asList(Format.values()) +
                        ", default being " + DEFAULT_FORMAT + ".");
    }

    private Option createCompactOption() {
        Option option = createOption(null, "compact", "Generate compact output (default is pretty-printed).");
        option.setArgs(0);
        return option;
    }

    private Option createUserAgentOption() {
        return createOption(
                "ua",
                "user-agent",
                "Set the user agent. Default is the one by the browser you use. Only works with Chrome.");
    }

    private Option createWindowSizeOption() {
        return createOption("w", "window-size",
                "The size of the browser window: <width>x<height>, e.g. 400x600. " +
                        "Only works with Chrome and Firefox.");
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
        if (line.hasOption("b")) {
            String browser = line.getOptionValue("b");
            try {
                Browser.valueOf(browser);
            } catch (IllegalArgumentException e) {
                throw new ParseException("Invalid browser: " + browser);
            }
        }
    }

    void validateFormatOption(CommandLine line) throws ParseException {
        if (line.hasOption("f")) {
            String format = line.getOptionValue("f");
            try {
                Format.valueOf(format);
            } catch (IllegalArgumentException e) {
                throw new ParseException("Invalid format: " + format);
            }
        }
    }

    private void validateIterationsOption(CommandLine line) throws ParseException {
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

    private void validateWindowSizeOption(CommandLine line) throws ParseException {
        String size = line.getOptionValue("w");
        if (size != null) {
            if (!size.matches("\\d+x\\d+")) {
                throw new ParseException("Window size is <width>x<height>");
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
    	
    	if (getClass().getPackage().getImplementationVersion()==null)
    		System.out.println("unknown");
    	else System.out.println(getClass().getPackage().getImplementationVersion());
    }

}
