package net.browsertime.tool.timings;

import javax.xml.bind.annotation.adapters.XmlAdapter;

import net.browsertime.tool.timings.TimingRun;

public class TimingRunXmlAdapter extends XmlAdapter<TimingRun, TimingRun> {
  private final boolean include;

  public TimingRunXmlAdapter(boolean include) {
    this.include = include;
  }

  @Override
  public TimingRun unmarshal(TimingRun v) throws Exception {
    if (include) {
      return v;
    }
    return null;
  }

  @Override
  public TimingRun marshal(TimingRun v) throws Exception {
    if (include) {
      return v;
    }
    return null;
  }
}
