package net.browsertime.tool;

public class BrowserTimeException extends Exception {
  public BrowserTimeException(String message, Throwable cause) {
    super(message, cause);
  }

  public BrowserTimeException(String message) {
    super(message);
  }

}
