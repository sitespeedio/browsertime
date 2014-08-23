package net.browsertime.tool.run;

import java.io.Writer;
import java.util.Map;

import net.browsertime.tool.BasicAuth;
import net.browsertime.tool.BrowserConfig;
import net.browsertime.tool.Headers;

/**
 *
 */
public class TimingConfig {
  // tool options
  public boolean verbose;
  public boolean debugMode;

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
  
  public BasicAuth basicAuth;
  
  public Headers headers;
}
