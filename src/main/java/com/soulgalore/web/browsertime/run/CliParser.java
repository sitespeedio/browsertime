package com.soulgalore.web.browsertime.run;

import com.soulgalore.web.browsertime.BrowserConfig;
import org.apache.commons.cli.*;

import java.io.*;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;

import static java.util.Arrays.asList;

/**
 *
 */
public class CliParser {
    public static final Browser DEFAULT_BROWSER = Browser.firefox;
    public static final Format DEFAULT_FORMAT = Format.xml;
    public static final int DEFAULT_TIMEOUT_SECONDS = 60;
    public static final int DEFAULT_NUMBER_OF_ITERATIONS = 3;

    private CommandLine commandLine;
    private final Options options;

    public CliParser() {
        options = createCliOptions();
    }

    public void parseArgs(String[] args) throws ParseException {
        Parser parser = new BasicParser();
        commandLine = parser.parse(options, args);
    }

    public boolean shouldShowHelp() {
        return commandLine.hasOption("h");
    }

    public boolean shouldShowVersion() {
        return commandLine.hasOption("version");
    }

    public URL parseUrl() throws MalformedURLException, ParseException {
        String[] urlArgs = commandLine.getArgs();
        if (urlArgs.length != 1) {
            throw new ParseException("One url must be passed as the last argument.");
        }

        return new URL(urlArgs[0]);
    }

    public TimingConfig parseTimingConfig() throws IOException, ParseException {
        TimingConfig config = new TimingConfig();

        config.numIterations = parseIterations();
        config.shouldPrettyPrint = !commandLine.hasOption("compact");
        config.shouldIncludeRuns = commandLine.hasOption("raw");
        config.browser = parseBrowser();
        config.timeoutSeconds = parseTimeout();
        config.format = parseFormat();

        config.outputWriter = parseSerializationWriter(commandLine.getOptionValue("o"));

        config.browserOptions = parseBrowserOptions();

        return config;
    }

    private Map<BrowserConfig, String> parseBrowserOptions() throws ParseException {
        Map<BrowserConfig, String> map = new HashMap<BrowserConfig, String>();

        String size = commandLine.getOptionValue("w");
        if (size != null) {
            if (!size.matches("\\d+x\\d+")) {
                throw new ParseException("Window size is <width>x<height>");
            }
            map.put(BrowserConfig.windowSize, size);
        }

        String ua = commandLine.getOptionValue("ua");
        if (ua != null) {
            map.put(BrowserConfig.userAgent, ua);
        }

        return map;
    }

    private Browser parseBrowser() throws ParseException {
        String browser = commandLine.getOptionValue("b", DEFAULT_BROWSER.name());
        try {
            return Browser.valueOf(browser);
        } catch (IllegalArgumentException e) {
            throw new ParseException("Invalid browser: " + browser);
        }
    }

    private int parseTimeout() throws ParseException {
        if (!commandLine.hasOption("t")) {
            return DEFAULT_TIMEOUT_SECONDS;
        }
        String timeout = commandLine.getOptionValue("t");
        try {
            int i = Integer.parseInt(timeout);
            if (i <= 0) {
                throw new ParseException("Must specify timeout >= 0 seconds.");
            }
            return i;
        } catch (NumberFormatException e) {
            throw new ParseException("Invalid number: " + timeout);
        }
    }

    private Format parseFormat() throws ParseException {
        String format = commandLine.getOptionValue("f", DEFAULT_FORMAT.name());
        try {
            return Format.valueOf(format);
        } catch (IllegalArgumentException e) {
            throw new ParseException("Invalid format: " + format);
        }
    }

    private int parseIterations() throws ParseException {
        if (!commandLine.hasOption("n")) {
            return DEFAULT_NUMBER_OF_ITERATIONS;
        }
        String iterations = commandLine.getOptionValue("n");
        try {
            int i = Integer.parseInt(iterations);
            if (i <= 0) {
                throw new ParseException("Must specify >= 1 runs.");
            }
            return i;
        } catch (NumberFormatException e) {
            throw new ParseException("Invalid number: " + iterations);
        }
    }

    private Writer parseSerializationWriter(String filename) throws IOException {
        if (filename == null) {
            return new OutputStreamWriter(System.out);
        } else {
            File file = new File(filename);
            return new FileWriter(file);
        }
    }

    private Options createCliOptions() {
        return new Options()
                .addOption(createIterationsOption())
                .addOption(createBrowserOption())
                .addOption(createOutputOption())
                .addOption(createTimeoutOption())
                .addOption(createFormatOption())
                .addOption(createCompactOption())
                .addOption(createRawOption())
                .addOption(createUserAgentOption())
                .addOption(createWindowSizeOption())
                .addOption(createHelpOption())
                .addOption(createVerboseOption())
                .addOption(createVersionOption());
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

    private Option createTimeoutOption() {
        return createOption("t", "timeout",
                "Number of seconds to wait for url to complete loading before giving up" +
                        ", default being " + DEFAULT_TIMEOUT_SECONDS + ".");
    }

    private Option createCompactOption() {
        Option option = createOption(null, "compact", "Generate compact output (default is pretty-printed).");
        option.setArgs(0);
        return option;
    }

    private Option createRawOption() {
        Option option = createOption(null, "raw", "Include raw metrics data from each test run (excluded by default).");
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

    private Option createVerboseOption() {
        Option option = createOption("v", "verbose",
                "Turn on verbose output, reporting progress as browsertime runs.");
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

    void printUsage() {
        HelpFormatter helpFormatter = new HelpFormatter();
        helpFormatter.printHelp("browsertime [options] URL", options);
    }

    void printVersion() {
        String implementationVersion = getClass().getPackage().getImplementationVersion();
        implementationVersion = implementationVersion != null ? implementationVersion : "unknown";

        System.out.println(implementationVersion);
    }
}
