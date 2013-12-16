package net.browsertime.tool.run;

import net.browsertime.tool.BrowserConfig;

import java.io.Writer;
import java.util.Map;

/**
 *
 */
public class TimingConfig {
    public int numIterations = 1;
    public Browser browser;
    public Map<BrowserConfig, String> browserOptions;
    public int timeoutSeconds;

    // output config
    public Format format;
    public Writer outputWriter;
    public boolean shouldPrettyPrint;
    public boolean shouldIncludeRuns;
}
