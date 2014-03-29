package net.browsertime.tool.timings;

public class OptionalNonScientificDoubleAdapter extends NonScientificDoubleAdapter {
  @Override
  public String marshal(Double v) throws Exception {
    return (v != null && v > 0) ? super.marshal(v) : null;
  }
}
