package net.browsertime.tool;

import java.io.IOException;
import java.io.Writer;
import java.net.URL;

import javax.annotation.Nullable;

import net.browsertime.tool.har.HarGenerator;
import net.browsertime.tool.proxy.BrowserProxy;
import net.browsertime.tool.serializer.Serializer;
import net.browsertime.tool.timingrunner.TimingRunner;
import net.browsertime.tool.timings.TimingSession;

import com.google.inject.Inject;

public class BrowserTime {
  private final TimingRunner timingRunner;
  private final Serializer serializer;
  private final BrowserProxy browserProxy;
  private final HarGenerator harGenerator;

  @Inject
  public BrowserTime(TimingRunner timingRunner, Serializer serializer,
                     @Nullable BrowserProxy browserProxy, @Nullable HarGenerator harGenerator) {
    this.timingRunner = timingRunner;
    this.serializer = serializer;
    this.browserProxy = browserProxy;
    this.harGenerator = harGenerator;
  }

  public void run(URL url, int numIterations, Writer outputWriter, Writer harWriter) throws IOException, BrowserTimeException {
    if (browserProxy != null) {
      browserProxy.start();
    }

    TimingSession session = timingRunner.run(url, numIterations);
    serializer.serialize(session, outputWriter);

    if (harGenerator != null) {
      harGenerator.addTimingDataToHar(session);
      harGenerator.writeHar(harWriter);
    }

    if (browserProxy != null) {
      browserProxy.stop();
    }
  }
}
