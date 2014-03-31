package net.browsertime.tool;

import java.io.IOException;
import java.io.Writer;
import java.net.URL;

import net.browsertime.tool.serializer.Serializer;
import net.browsertime.tool.timingrunner.TimingRunner;
import net.browsertime.tool.timings.TimingSession;

import com.google.inject.Inject;

public class BrowserTime {
  private TimingRunner timingRunner;
  private Serializer serializer;

  @Inject
  public BrowserTime(TimingRunner timingRunner, Serializer serializer) {
    this.timingRunner = timingRunner;
    this.serializer = serializer;
  }

  public void run(URL url, int numIterations, Writer writer) throws IOException, BrowserTimeException {
    TimingSession session = timingRunner.run(url, numIterations);
    serializer.serialize(session, writer);
  }
}
