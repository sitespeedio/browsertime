package net.browsertime.tool.webdriver;

import net.browsertime.tool.BrowserTimeException;

public class WebDriverValidationException extends BrowserTimeException {

  public WebDriverValidationException(String message) {
    super(message);
  }

  public WebDriverValidationException(String message, Throwable cause) {
    super(message, cause);
  }
}
