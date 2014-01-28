package net.browsertime.tool.run;

import static java.util.Arrays.asList;
import static net.browsertime.tool.run.CliParser.OptionString.browserOption;
import static net.browsertime.tool.run.CliParser.OptionString.compactOption;
import static net.browsertime.tool.run.CliParser.OptionString.formatOption;
import static net.browsertime.tool.run.CliParser.OptionString.helpOption;
import static net.browsertime.tool.run.CliParser.OptionString.iterationsOption;
import static net.browsertime.tool.run.CliParser.OptionString.outputOption;
import static net.browsertime.tool.run.CliParser.OptionString.proxyHostOption;
import static net.browsertime.tool.run.CliParser.OptionString.rawOption;
import static net.browsertime.tool.run.CliParser.OptionString.timeoutOption;
import static net.browsertime.tool.run.CliParser.OptionString.userAgentOption;
import static net.browsertime.tool.run.CliParser.OptionString.verboseOption;
import static net.browsertime.tool.run.CliParser.OptionString.versionOption;
import static net.browsertime.tool.run.CliParser.OptionString.windowSizeOption;

import net.browsertime.tool.BrowserConfig;
import org.apache.commons.cli.BasicParser;
import org.apache.commons.cli.CommandLine;
import org.apache.commons.cli.HelpFormatter;
import org.apache.commons.cli.Option;
import org.apache.commons.cli.Options;
import org.apache.commons.cli.ParseException;
import org.apache.commons.cli.Parser;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;

/**
 *
 */
public class CliParser {
  private static final Browser DEFAULT_BROWSER = Browser.firefox;
  private static final Format DEFAULT_FORMAT = Format.xml;
  private static final int DEFAULT_TIMEOUT_SECONDS = 60;
  private static final int DEFAULT_NUMBER_OF_ITERATIONS = 3;
  private final Options options;
  private CommandLine commandLine;

  public CliParser() {
    options = createCliOptions();
  }

  public void parseArgs(String[] args) throws ParseException {
    Parser parser = new BasicParser();
    commandLine = parser.parse(options, args);
  }

  public boolean shouldShowHelp() {
    return commandLine.hasOption(helpOption.longForm);
  }

  public boolean shouldShowVersion() {
    return commandLine.hasOption(versionOption.longForm);
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

    config.verbose = commandLine.hasOption("v");
    config.numIterations = parseIterations();
    config.shouldPrettyPrint = !commandLine.hasOption(compactOption.longForm);
    config.shouldIncludeRuns = commandLine.hasOption(rawOption.longForm);
    config.browser = parseBrowser();
    config.timeoutSeconds = parseTimeout();
    config.format = parseFormat();

    config.outputWriter =
        parseSerializationWriter(commandLine.getOptionValue(outputOption.longForm));

    config.browserOptions = parseBrowserOptions();

    return config;
  }

  private Map<BrowserConfig, String> parseBrowserOptions() throws ParseException {
    Map<BrowserConfig, String> map = new HashMap<BrowserConfig, String>();

    String size = commandLine.getOptionValue(windowSizeOption.longForm);
    if (size != null) {
      if (!size.matches("\\d+x\\d+")) {
        throw new ParseException("Window size is <width>x<height>");
      }
      map.put(BrowserConfig.windowSize, size);
    }

    String ua = commandLine.getOptionValue(userAgentOption.longForm);
    if (ua != null) {
      map.put(BrowserConfig.userAgent, ua);
    }

    String proxyHost = commandLine.getOptionValue(proxyHostOption.longForm);
    if (proxyHost != null) {
      try {
        new URI(proxyHost);
      } catch (URISyntaxException e) {
        throw new ParseException("Invalid proxy url: " + proxyHost);
      }

      map.put(BrowserConfig.proxyHost, proxyHost);
    }

    return map;
  }

  private Browser parseBrowser() throws ParseException {
    String browser = commandLine.getOptionValue(browserOption.longForm, DEFAULT_BROWSER.name());
    try {
      return Browser.valueOf(browser);
    } catch (IllegalArgumentException e) {
      throw new ParseException("Invalid browser: " + browser);
    }
  }

  private int parseTimeout() throws ParseException {
    if (!commandLine.hasOption(timeoutOption.longForm)) {
      return DEFAULT_TIMEOUT_SECONDS;
    }
    String timeout = commandLine.getOptionValue(timeoutOption.longForm);
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
    String format = commandLine.getOptionValue(formatOption.longForm, DEFAULT_FORMAT.name());
    try {
      return Format.valueOf(format);
    } catch (IllegalArgumentException e) {
      throw new ParseException("Invalid format: " + format);
    }
  }

  private int parseIterations() throws ParseException {
    if (!commandLine.hasOption(iterationsOption.longForm)) {
      return DEFAULT_NUMBER_OF_ITERATIONS;
    }
    String iterations = commandLine.getOptionValue(iterationsOption.longForm);
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
    return new Options().addOption(createIterationsOption()).addOption(createBrowserOption())
        .addOption(createOutputOption()).addOption(createTimeoutOption())
        .addOption(createFormatOption()).addOption(createProxyOption())
        .addOption(createCompactOption()).addOption(createRawOption())
        .addOption(createUserAgentOption()).addOption(createWindowSizeOption())
        .addOption(createVerboseOption()).addOption(createVersionOption())
        .addOption(createHelpOption()).addOption(createVersionOption());
  }

  private Option createIterationsOption() {
    return createOption(iterationsOption, "The number of times to run the test, default being 3.");
  }

  private Option createBrowserOption() {
    return createOption(browserOption, "The browser to use. Supported values are: "
        + asList(Browser.values()) + ", default being " + DEFAULT_BROWSER + ".");
  }

  private Option createOutputOption() {
    return createOption(outputOption, "Output the result as a file, give the name of the file. "
        + "If no filename is given, the result is put on standard out.");
  }


  private Option createFormatOption() {
    return createOption(formatOption, "The desired output format. Supported values are: "
        + asList(Format.values()) + ", default being " + DEFAULT_FORMAT + ".");
  }

  private Option createProxyOption() {
    return createOption(proxyHostOption,
        "Proxy server host (including optional port) to use for http requests in browser, "
            + "e.g. proxy.myserver.com:1234.");
  }

  private Option createTimeoutOption() {
    return createOption(timeoutOption,
        "Number of seconds to wait for url to complete loading before giving up"
            + ", default being " + DEFAULT_TIMEOUT_SECONDS + ".");
  }

  private Option createCompactOption() {
    Option option =
        createOption(compactOption, "Generate compact output (default is pretty-printed).");
    option.setArgs(0);
    return option;
  }

  private Option createRawOption() {
    Option option =
        createOption(rawOption,
            "Include raw metrics data from each test run (excluded by default).");
    option.setArgs(0);
    return option;
  }

  private Option createUserAgentOption() {
    return createOption(
        userAgentOption,
        "Set the user agent. Default is the one by the browser you use. Only works with Chrome and Firefox.");
  }

  private Option createWindowSizeOption() {
    return createOption(windowSizeOption,
        "The size of the browser window: <width>x<height>, e.g. 400x600. "
            + "Only works with Chrome and Firefox.");
  }

  private Option createHelpOption() {
    Option option = createOption(helpOption, "Show this help message");
    option.setArgs(0);
    return option;
  }

  private Option createVerboseOption() {
    Option option =
        createOption(verboseOption,
            "Turn on verbose output, reporting progress as browsertime runs.");
    option.setArgs(0);
    return option;
  }

  private Option createVersionOption() {
    Option option = createOption(versionOption, "Show version information");
    option.setArgs(0);
    return option;
  }

  /**
   * Create an optional Option with one argument.
   */
  private Option createOption(OptionString optionString, String description) {
    final Option option = new Option(optionString.shortForm, description);
    option.setLongOpt(optionString.longForm);
    option.setArgName(optionString.longForm.toUpperCase());
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

  protected enum OptionString {
    iterationsOption("n", "times"), browserOption("b", "browser"), outputOption("o", "output"), timeoutOption(
        "t", "timeout"), formatOption("f", "format"), proxyHostOption("p", "proxyHost"), compactOption(
        null, "compact"), rawOption(null, "raw"), userAgentOption("ua", "user-agent"), windowSizeOption(
        "w", "window-size"), verboseOption("v", "verbose"), helpOption("h", "help"), versionOption(
        "V", "version");


    public final String shortForm;
    public final String longForm;

    OptionString(String shortForm, String longForm) {
      this.shortForm = shortForm;
      this.longForm = longForm;
    }
  }
}
