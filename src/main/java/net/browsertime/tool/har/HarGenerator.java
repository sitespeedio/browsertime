package net.browsertime.tool.har;

import java.io.IOException;
import java.io.Writer;

import net.browsertime.tool.timings.TimingSession;

public interface HarGenerator {
  void startSession();
  void endSession();

  void startRun();
  void endRun();

  void addTimingDataToHar(TimingSession session);

  void writeHar(Writer writer) throws IOException;
}
