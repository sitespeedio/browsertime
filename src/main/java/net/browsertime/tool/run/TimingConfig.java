package net.browsertime.tool.run;

import java.io.Writer;
import java.util.Map;

import net.browsertime.tool.BrowserConfig;

/**
 *
 */
public class TimingConfig {
  // tool options
  public boolean verbose;
  public boolean debug;

  // measurement options
  public int numIterations = 1;
  public Browser browser;
  public Map<BrowserConfig, String> browserOptions;
  public int timeoutSeconds;

  // output config
  public Format format;
  public Writer outputWriter;
  public boolean shouldPrettyPrint;
  public boolean shouldIncludeRuns;

  public Writer harWriter;
}
