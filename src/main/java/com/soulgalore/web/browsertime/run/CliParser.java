package com.soulgalore.web.browsertime.run;

import com.soulgalore.web.browsertime.BrowserConfig;
import org.apache.commons.cli.CommandLine;
import org.apache.commons.cli.ParseException;

import java.io.*;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;

import static com.soulgalore.web.browsertime.run.CliHelper.DEFAULT_BROWSER;
import static com.soulgalore.web.browsertime.run.CliHelper.DEFAULT_FORMAT;

/**
 *
 */
public class CliParser {
    private CommandLine commandLine;

    public static CliParser parseArgs(String[] args) throws ParseException {
        CliHelper helper = new CliHelper();
        CommandLine commandLine = helper.parse(args);

        return new CliParser(commandLine);
    }

    public boolean shouldShowHelp() {
        return commandLine.hasOption("h");
    }

    public boolean shouldShowVersion() {
        return commandLine.hasOption("version");
    }

    public URL parseUrl() throws MalformedURLException {
        return new URL(commandLine.getArgs()[0]);
    }

    public TimingConfig parseTimingConfig() throws IOException {
        TimingConfig config = new TimingConfig();

        config.numIterations = Integer.parseInt(commandLine.getOptionValue("n", "3"));
        config.shouldPrettyPrint = !commandLine.hasOption("compact");
        config.browser = Browser.valueOf(commandLine.getOptionValue("b", DEFAULT_BROWSER.name()));
        config.format = Format.valueOf(commandLine.getOptionValue("f", DEFAULT_FORMAT.name()));

        config.outputWriter = parseSerializationWriter(commandLine.getOptionValue("o"));

        config.browserOptions = new HashMap<BrowserConfig, String>();

        addConfigIfPresent(commandLine, "ua", config.browserOptions, BrowserConfig.userAgent);
        addConfigIfPresent(commandLine, "w", config.browserOptions, BrowserConfig.windowSize);

        return config;
    }

    private void addConfigIfPresent(CommandLine line, String option,
                                    Map<BrowserConfig, String> configs, BrowserConfig config) {
        String value = line.getOptionValue(option);
        if (value != null) {
            configs.put(config, value);
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

    private CliParser(CommandLine commandLine) {
        this.commandLine = commandLine;
    }

    /**
     *
     */
    private CliParser() {

    }
}
