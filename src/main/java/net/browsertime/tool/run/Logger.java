package net.browsertime.tool.run;

public class Logger {
  private boolean verbose;
  private boolean debug;

  public Logger(boolean verbose, boolean debug) {
    this.verbose = verbose;
    this.debug = debug;
  }

  public void printStatus(String message) {
    if (verbose) {
      System.err.println(message);
    }
  }

  public void printDebug(String message) {
    if (debug) {
      System.err.println(message);
    }
  }
}
