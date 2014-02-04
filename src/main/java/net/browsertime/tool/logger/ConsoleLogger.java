package net.browsertime.tool.logger;

public class ConsoleLogger implements Logger {
  private boolean verbose;
  private boolean debug;

  public ConsoleLogger(boolean verbose, boolean debug) {
    this.verbose = verbose;
    this.debug = debug;
  }

  @Override
  public void printStatus(String message) {
    if (verbose) {
      System.err.println(message);
    }
  }

  @Override
  public void printDebug(String message) {
    if (debug) {
      System.err.println(message);
    }
  }
}
