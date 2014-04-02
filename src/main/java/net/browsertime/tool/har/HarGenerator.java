package net.browsertime.tool.har;

import java.io.IOException;
import java.io.Writer;

public interface HarGenerator {
  void startSession();
  void endSession();

  void startRun();
  void endRun();

  public void writeHar(Writer writer) throws IOException;
}
